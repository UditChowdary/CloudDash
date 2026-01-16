import { randomUUID } from "crypto";
import { GetCommand, PutCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "./lib/dynamo.js";
import { jsonResponse, emptyResponse } from "./lib/response.js";

const TABLE_NAME = process.env.FINANCES_TABLE;

export const handler = async (event) => {
  const method = event.httpMethod;

  if (method === "OPTIONS") {
    return emptyResponse(204);
  }

  try {
    const id = event.pathParameters?.id;

    if (method === "GET") {
      if (id) {
        const result = await docClient.send(
          new GetCommand({ TableName: TABLE_NAME, Key: { id } })
        );
        return jsonResponse(200, result.Item || null);
      }
      const result = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
      return jsonResponse(200, { items: result.Items || [] });
    }

    if (method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const item = {
        id: body.id || randomUUID(),
        title: body.title,
        type: body.type || "expense",
        amount: Number(body.amount || 0),
        category: body.category || "General",
        createdAt: body.createdAt || new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return jsonResponse(201, item);
    }

    if (method === "PUT") {
      if (!id) {
        return jsonResponse(400, { message: "Missing id" });
      }
      const body = JSON.parse(event.body || "{}");
      const item = { id, ...body };
      await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
      return jsonResponse(200, item);
    }

    if (method === "DELETE") {
      if (!id) {
        return jsonResponse(400, { message: "Missing id" });
      }
      await docClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
      return emptyResponse(204);
    }

    return jsonResponse(405, { message: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return jsonResponse(500, { message: "Server error" });
  }
};
