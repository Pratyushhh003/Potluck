import driver from "../config/neo4j.js";

export const getPopularityGraph = async (req, res) => {
  const session = driver.session();
  try {
    const { locality } = req.query;

    await session.run(
      `
      MERGE (c:Cook {id: "demo1", name: "Priya", locality: $locality})
      MERGE (c2:Cook {id: "demo2", name: "Ravi", locality: $locality})
      MERGE (c3:Cook {id: "demo3", name: "Sunita", locality: $locality})
      MERGE (b:Buyer {id: "buyer1", name: "Amit"})
      MERGE (b2:Buyer {id: "buyer2", name: "Neha"})
      MERGE (b)-[:ORDERED_FROM {count: 5}]->(c)
      MERGE (b)-[:ORDERED_FROM {count: 2}]->(c2)
      MERGE (b2)-[:ORDERED_FROM {count: 8}]->(c)
      MERGE (b2)-[:ORDERED_FROM {count: 3}]->(c3)
    `,
      { locality: locality || "Delhi" },
    );

    const result = await session.run(
      `
      MATCH (b:Buyer)-[o:ORDERED_FROM]->(c:Cook)
      WHERE c.locality = $locality
      RETURN c.id AS cookId, c.name AS cookName,
             count(o) AS orderCount,
             sum(o.count) AS totalOrders
      ORDER BY totalOrders DESC
    `,
      { locality: locality || "Delhi" },
    );

    const edgeResult = await session.run(
      `
      MATCH (b:Buyer)-[o:ORDERED_FROM]->(c:Cook)
      WHERE c.locality = $locality
      RETURN b.id AS buyerId, b.name AS buyerName,
             c.id AS cookId, c.name AS cookName,
             o.count AS count
    `,
      { locality: locality || "Delhi" },
    );

    const nodes = [];
    const nodeIds = new Set();

    result.records.forEach((record) => {
      const cookId = record.get("cookId");
      if (!nodeIds.has(cookId)) {
        nodeIds.add(cookId);
        nodes.push({
          id: cookId,
          name: record.get("cookName"),
          type: "cook",
          totalOrders: record.get("totalOrders").toNumber(),
          orderCount: record.get("orderCount").toNumber(),
        });
      }
    });

    edgeResult.records.forEach((record) => {
      const buyerId = record.get("buyerId");
      if (!nodeIds.has(buyerId)) {
        nodeIds.add(buyerId);
        nodes.push({
          id: buyerId,
          name: record.get("buyerName"),
          type: "buyer",
          totalOrders: 0,
          orderCount: 0,
        });
      }
    });

    const links = edgeResult.records.map((record) => ({
      source: record.get("buyerId"),
      target: record.get("cookId"),
      count: record.get("count").toNumber(),
    }));

    res.json({ success: true, nodes, links });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};

export const recordOrder = async (req, res) => {
  const session = driver.session();
  try {
    const { buyerId, buyerName, cookId, cookName, locality } = req.body;
    await session.run(
      `
      MERGE (b:Buyer {id: $buyerId})
      SET b.name = $buyerName
      MERGE (c:Cook {id: $cookId})
      SET c.name = $cookName, c.locality = $locality
      MERGE (b)-[o:ORDERED_FROM]->(c)
      ON CREATE SET o.count = 1
      ON MATCH SET o.count = o.count + 1
    `,
      { buyerId, buyerName, cookId, cookName, locality },
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Neo4j graph error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    await session.close();
  }
};
