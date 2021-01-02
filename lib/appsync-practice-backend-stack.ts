import * as cdk from "@aws-cdk/core";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as appsync from "@aws-cdk/aws-appsync";
import { join } from "path";

export class AppsyncPracticeBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //  DynamoDB Table
    const userTable = new dynamodb.Table(this, "UserTable", {
      partitionKey: { name: "user_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "user_table",
    });
    const articleTable = new dynamodb.Table(this, "ArticleTable", {
      partitionKey: { name: "article_id", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "article_table",
    });

    //  GraphQL API
    const api = new appsync.GraphqlApi(this, "GraphQLApi", {
      name: "GraphQL Api Sample",
      schema: appsync.Schema.fromAsset(join(__dirname, "schema.graphql")),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
        },
      },
      logConfig: {
        excludeVerboseContent: true,
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      xrayEnabled: false,
    });

    //  Data Source
    const userTableDataStore = api.addDynamoDbDataSource(
      "UserTableDataSource",
      userTable
    );
    const articleTableDataStore = api.addDynamoDbDataSource(
      "ArticleTableDataSource",
      articleTable
    );

    // Query Resolver
    userTableDataStore.createResolver({
      typeName: "Query",
      fieldName: "getUserData",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        join(__dirname, "getUserListRequest.vtl")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
    userTableDataStore.createResolver({
      typeName: "Query",
      fieldName: "getUserList",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });
    articleTableDataStore.createResolver({
      typeName: "Query",
      fieldName: "getArticleList",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        join(__dirname, "getArticleListRequest.vtl")
      ),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(
        join(__dirname, "getArticleListResponse.vtl")
      ),
    });

    // Mutation Resolver
    userTableDataStore.createResolver({
      typeName: "Mutation",
      fieldName: "createUser",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        join(__dirname, "createUserRequest.vtl")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
    articleTableDataStore.createResolver({
      typeName: "Mutation",
      fieldName: "createArticle",
      requestMappingTemplate: appsync.MappingTemplate.fromFile(
        join(__dirname, "createArticleRequest.vtl")
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });
  }
}
