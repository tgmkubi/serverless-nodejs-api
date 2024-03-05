const serverless = require("serverless-http");
const express = require("express");
const { getDbClient } = require("./db/clients");
const crud = require("./db/crud");
const validators = require("./db/validators");

const STAGE = process.env.STAGE || "prod";

const app = express();
app.use(express.json());

app.get("/", async (req, res, next) => {
  console.log(process.env.DEBUG);
  const sql = await getDbClient();
  const now = Date.now();
  const [dbNowResult] = await sql`SELECT now()`;
  const delta = (dbNowResult.now.getTime() - now) / 1000;
  return res.status(200).json({
    message: "Hello from root!",
    delta,
    STAGE: STAGE,
  });
});

app.get("/path", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});

app.get("/leads", async (req, res, next) => {
  const results = await crud.listAllLeads();
  return res.status(200).json({
    results,
  });
});

app.post("/leads", async (req, res, next) => {
  const postData = await req.body;
  // zod validation
  const {data, hasError, message} = await validators.validateLead(postData);
  if(hasError) {
    return res.status(400).json({
      message: message ? message : "Invalid request. Please try again."
    });  
  } else if(hasError === undefined) {
    return res.status(500).json({
      results: "Server Error"
    });
  }

  const result = await crud.newLead(data);
  return res.status(201).json({
    results: result,
  });
});

app.get("/leads/:id", async (req, res, next) => {
  const result = await crud.listSingleLead(req.params.id);
  return res.status(200).json({
    results: result,
  });
});

app.put("/leads/:id", async (req, res, next) => {
  const result = await crud.editLead(req.params.id, req.body);
  return res.status(200).json({
    results: result,
  });
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
