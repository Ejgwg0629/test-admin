import buildGqlQuery from "./buildGqlQuery";
import buildVariables from "./buildVariables";
import getResponseParser from "./getResponseParser";

export const buildQueryFactory = (buildVariablesImpl, buildGqlQueryImpl, getResponseParserImpl) => (
  introspectionResults
) => {
  const knownResources = introspectionResults.resources.map((r) => r.type.name);

  // We need too much assertion here, got tired..
  const pkQueries = introspectionResults.queries.filter((query) => /_by_pk$/.test(query.name));
  const tableNames = pkQueries.map((pkQuery) => pkQuery.type.name);
  const tableColumns = introspectionResults.types
    .filter((type) => tableNames.includes(type.name))
    .reduce((acc, type) => {
      const columns = type.fields.map((field) => field.name);
      acc[type.name] = columns;
      return acc;
    }, {});
  introspectionResults.tables = pkQueries.reduce((acc, pkQuery) => {
    const tableName = pkQuery.type.name;
    const pkNames = pkQuery.args.map((key) => key.name);
    if (tableColumns[tableName].includes("id")) {
      acc[tableName] = {
        isTarget: false,
        keys: pkNames
      };
    } else {
      acc[tableName] = {
        isTarget: true,
        keys: pkNames
      };
    }
    return acc;
  }, {});

  return (aorFetchType, resourceName, params) => {
    const resource = introspectionResults.resources.find((r) => r.type.name === resourceName);

    if (!resource) {
      throw new Error(
        `Unknown resource ${resourceName}. Make sure it has been declared on your server side schema. Known resources are ${knownResources.join(
          ", "
        )}`
      );
    }

    const queryType = resource[aorFetchType];

    if (!queryType) {
      throw new Error(
        `No query or mutation matching fetch type ${aorFetchType} could be found for resource ${resource.type.name}`
      );
    }

    const variables = buildVariablesImpl(introspectionResults)(
      resource,
      aorFetchType,
      params,
      queryType
    );
    const query = buildGqlQueryImpl(introspectionResults)(
      resource,
      aorFetchType,
      queryType,
      variables
    );
    const parseResponse = getResponseParserImpl(introspectionResults)(
      aorFetchType,
      resource,
      queryType
    );

    return {
      query,
      variables,
      parseResponse
    };
  };
};

export default buildQueryFactory(buildVariables, buildGqlQuery, getResponseParser);
