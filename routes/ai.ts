import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

router.post("/tutor", async (req: Request, res: Response) => {
  const { message, courseName, userContext } = req.body;
  if (!message) { res.status(400).json({ error: "Message content required" }); return; }

  const sysPrompt = `
  You are 'DMA AI Assistant', an elite, highly knowledgeable AI instructor at the Digital Manufacturing Academy (inspired by BCU and AIUB researchers).
  Your expertise spans Industry 4.0, Industry 5.0, Cyber-Physical Systems, PLC Programming (Ladder Logic), Siemens S7-1200 setups, G-code Generation, MQTT protocols, Additive Manufacturing (3D Printing with metallic FDM, SLA, SLS), Digital Twins, and industrial circular economy.
  
  The student is currently checking: "${courseName || "General Academy Catalog"}".
  User details: "${userContext || "Visitor Student"}".

  Provide:
  1. Instant, highly professional, direct answers with neat, clear technical bullet points where suitable.
  2. Friendly, non-robotic, helpful guidance. Keep explanations incredibly clear, and encourage sustainable smart engineering paradigms.
  3. Keep the output formatted cleanly as Markdown. Avoid long-winded conversational greetings.
  `;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    setTimeout(() => {
      res.json({
        status: "mock_success",
        reply: `### Industrial IoT & Digital Twin Tutorial\n\nHello! I am your **DMA AI Companion**. To unlock live customized LLM queries, set a valid \`GEMINI_API_KEY\` in your secrets panel. Here is a quick breakdown about your query concerning **"${message.substring(0, 30)}..."**:\n\n* **Digital Twin Synchronicity:** Real-world sensors communicate over **MQTT** or **AMQP** to publish physical parameters (e.g., thermal, vibratory, hydraulic metrics) to an aggregate point (Broker).\n* **Industrial Automation:** Modern PLC networks like Siemens S7 controllers read telemetry and dispatch G-Code lines dynamically.\n* **Sustainability:** Real-time diagnostics optimize factory machines to power-down when idle, reducing idle grid power by up to 34%.\n\nWould you like me to supply the comprehensive SQL schema or Windows deployment scripts to take this offline?`
      });
    }, 1200);
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `${sysPrompt}\n\nStudent asks: ${message}` }] }],
    });
    res.json({ status: "success", reply: response.text || "I was unable to formulate a response. Please try rephrasing your question!" });
  } catch (error: any) {
    console.error("Gemini API call failed", error);
    res.status(500).json({ error: "An error occurred while contacting the Gemini AI engine.", details: error.message });
  }
});

export default router;
