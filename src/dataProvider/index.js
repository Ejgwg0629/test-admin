import merge from "lodash/merge";
import buildDataProvider from "ra-data-graphql";
import buildQueryFactory from "./buildQuery";
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
export { buildQueryFactory };

const defaultOptions = {
  buildQuery: buildQueryFactory,
  introspection: {
    operationNames: {
      [GET_LIST]: (resource) => `${resource.name}`,
      [GET_ONE]: (resource) => `${resource.name}`,
      [GET_MANY]: (resource) => `${resource.name}`,
      [GET_MANY_REFERENCE]: (resource) => `${resource.name}`,
      [CREATE]: (resource) => `insert_${resource.name}`,
      [UPDATE]: (resource) => `update_${resource.name}`,
      [UPDATE_MANY]: (resource) => `update_${resource.name}`,
      [DELETE]: (resource) => `delete_${resource.name}`,
      [DELETE_MANY]: (resource) => `delete_${resource.name}`
    }
  }
};

export default (options) => {
  return buildDataProvider(merge({}, defaultOptions, options)).then((dataProvider) => {
    return (fetchType, resource, params) => {
      return dataProvider(fetchType, resource, params);
    };
  });
};
