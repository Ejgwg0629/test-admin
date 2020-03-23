import {
  CREATE,
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
  GET_ONE,
  UPDATE,
  UPDATE_MANY
} from "./fetchActions";
import getFinalType from "./getFinalType";

const buildGetListVariables = (introspectionResults, resource, aorFetchType, params, queryType) => {
  const result = {};
  const { filter: filterObj = {}, customFilters = [] } = params;
  const tables = introspectionResults.tables;

  if (params.pagination) {
    result["limit"] = parseInt(params.pagination.perPage, 10);
    result["offset"] = parseInt((params.pagination.page - 1) * params.pagination.perPage, 10);
  }

  if (params.sort) {
    let fieldNames = Array.from(resource.type.fields.map((x) => x.name));
    if (fieldNames.indexOf(params.sort.field) >= 0) {
      result["order_by"] = {
        [params.sort.field]: params.sort.order.toLowerCase()
      };
    } else if (params.sort.field === "id") {
      // assert tables[queryType.name].isTarget is true
      const pks = tables[queryType.name].keys;
      result["order_by"] = pks.map((pk) => ({
        [pk]: params.sort.order.toLowerCase()
      }));
    }
  }

  var filters;
  if (tables[queryType.name].isTarget) {
    filters = Object.keys(filterObj).reduce((acc, key) => {
      let filter = [];
      if (key === "ids" || key === "id") {
        var accumulator = Array.from(JSON.parse(filterObj[key])).reduce((acc, fil) => {
          Object.keys(fil).map((key) => {
            if (!acc[key]) {
              acc[key] = new Set();
            }
            acc[key].add(fil[key]);
          });
          return acc;
        }, {});
        filter = Object.keys(accumulator).map((filterKey) => {
          filter.push({
            [filterKey]: {
              _in: accumulator[filterKey]
            }
          });
        });
      } else {
        const field = resource.type.fields.find((f) => f.name === key);
        switch (getFinalType(field.type).name) {
          case "String":
            filter = { [key]: { _ilike: "%" + filterObj[key] + "%" } };
            break;
          default:
            filter = { [key]: { _eq: filterObj[key] } };
        }
      }

      return [...acc, filter];
    }, customFilters);
  } else {
    filters = Object.keys(filterObj).reduce((acc, key) => {
      let filter;
      if (key === "ids") {
        filter = { id: { _in: filterObj["ids"] } };
      } else {
        const field = resource.type.fields.find((f) => f.name === key);
        switch (getFinalType(field.type).name) {
          case "String":
            filter = { [key]: { _ilike: "%" + filterObj[key] + "%" } };
            break;
          default:
            filter = { [key]: { _eq: filterObj[key] } };
        }
      }

      return [...acc, filter];
    }, customFilters);
  }

  result["where"] = { _and: filters };

  return result;
};

const buildUpdateVariables = (resource, aorFetchType, params, queryType) =>
  Object.keys(params.data).reduce((acc, key) => {
    // If hasura permissions do not allow a field to be updated like (id),
    // we are not allowed to put it inside the variables
    // RA passes the whole previous Object here
    // https://github.com/marmelab/react-admin/issues/2414#issuecomment-428945402

    // TODO: To overcome this permission issue,
    // it would be better to allow only permitted inputFields from *_set_input INPUT_OBJECT
    if (params.data[key] === params.previousData[key]) {
      return acc;
    }

    if (resource.type.fields.some((f) => f.name === key)) {
      return {
        ...acc,
        [key]: params.data[key]
      };
    }

    return acc;
  }, {});

const buildCreateVariables = (resource, aorFetchType, params, queryType) => {
  return params.data;
};

export default (introspectionResults) => (resource, aorFetchType, params, queryType) => {
  const tables = introspectionResults.tables;

  switch (aorFetchType) {
    case GET_LIST:
      return buildGetListVariables(introspectionResults, resource, aorFetchType, params, queryType);
    case GET_MANY_REFERENCE: {
      var built = buildGetListVariables(introspectionResults)(
        resource,
        aorFetchType,
        params,
        queryType
      );
      if (params.filter) {
        return {
          ...built,
          where: {
            _and: [...built["where"]["_and"], { [params.target]: { _eq: params.id } }]
          }
        };
      }
      return {
        ...built,
        where: {
          [params.target]: { _eq: params.id }
        }
      };
    }
    case GET_MANY:
    case DELETE_MANY:
      if (tables[queryType.name].isTarget) {
        let accumulator = params.ids.map(JSON.parse).reduce((acc, fil) => {
          Object.keys(fil).map((key) => {
            if (!acc[key]) {
              acc[key] = new Set();
            }
            acc[key].add(fil[key]);
          });
          return acc;
        }, {});
        return {
          where: {
            _and: Object.keys(accumulator).map((filterKey) => ({
              [filterKey]: {
                _in: Array.from(accumulator[filterKey])
              }
            }))
          }
        };
      } else
        return {
          where: { id: { _in: params.ids } }
        };

    case GET_ONE:
      return {
        where: { id: { _eq: params.id } },
        limit: 1
      };

    case DELETE:
      return {
        where: { id: { _eq: params.id } }
      };
    case CREATE:
      return {
        objects: buildCreateVariables(resource, aorFetchType, params, queryType)
      };

    case UPDATE:
      return {
        _set: buildUpdateVariables(resource, aorFetchType, params, queryType),
        where: { id: { _eq: params.id } }
      };

    case UPDATE_MANY:
      return {
        _set: buildUpdateVariables(resource, aorFetchType, params, queryType),
        where: { id: { _in: params.ids } }
      };
  }
};
