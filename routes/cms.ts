import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { requireAdmin, requirePermission } from "../middleware/helpers";

const router = Router();

const DEFAULT_CMS = {
  pages: [
    { id: "home", label: "Homepage", slug: "/", sections: [
      { id: "hero", type: "hero", title: "Hero Section", order: 0, visible: true, content: { badge: "British Council Funded • BCU & AIUB Partnership Program", headline: "Digital Manufacturing", headlineHighlight: "", subheadline: "", primaryCTA: "Start Free Learning", secondaryCTA: "Become Instructor" } },
      { id: "stats", type: "stats", title: "Statistics Bar", order: 1, visible: true, content: { items: [{ num: "5,200+", label: "Registered Students" }, { num: "12+", label: "Industry 4.0 Courses" }, { num: "50+", label: "Expert Instructors" }, { num: "3.4K+", label: "Global Certifications" }] } },
      { id: "categories", type: "categories", title: "Course Categories", order: 2, visible: true, content: { sectionTitle: "Manufacturing Disciplines & Labs", items: [{ icon: "🤖", name: "Industrial Robotics & Automation", count: "8" }, { icon: "🏭", name: "Smart Factory & IoT", count: "6" }, { icon: "🖨️", name: "Additive Manufacturing", count: "10" }, { icon: "💻", name: "Digital Twin Technology", count: "12" }, { icon: "🧠", name: "AI & Machine Learning", count: "7" }, { icon: "📐", name: "Physics-Based Simulation", count: "6" }] } },
      { id: "partnership", type: "partnership", title: "Partnership Section", order: 3, visible: true, content: { badge: "BCU–AIUB Strategic Alliance", title: "Built by World-Class Academics. Validated by Industry.", description: "A British Council funded Going Global Partnerships grant bringing BCU and AIUB together." } },
      { id: "faq", type: "faq", title: "FAQ Section", order: 4, visible: true, content: { sectionTitle: "Frequently Asked Questions", items: [{ q: "What makes this program different?", a: "Co-designed by leading academics from BCU and AIUB, funded by the British Council." }, { q: "Do I need prior experience?", a: "No prior manufacturing experience required." }, { q: "Are certificates recognized internationally?", a: "Yes — co-signed by BCU and AIUB and aligned with UK HE frameworks." }, { q: "Can I study at my own pace?", a: "Yes, all courses are fully asynchronous." }] } }
    ] },
    { id: "about", label: "About Page", slug: "/about", sections: [
      { id: "about_hero", type: "about_hero", title: "Page Header", order: 0, visible: true, content: { badge: "British Council Going Global Partnerships Grant", title: "About the Digital\nManufacturing Academy", subtitle: "Manufacturing Academy", description: "A transnational educational initiative co-developed by Birmingham City University and AIUB." } },
      { id: "about_outcomes", type: "outcomes", title: "Program Outcomes", order: 1, visible: true, content: { title: "Why This Program Matters", items: [{ title: "Globally Recognised Certification", desc: "Co-designed certificates aligned with UK HE frameworks." }, { title: "Transnational Education Synergy", desc: "Shared simulators and grading rubrics unify the learning experience across two continents." }, { title: "Open-Access Learning", desc: "Any engineering professional can upskill regardless of geography." }, { title: "Industry-Informed Curriculum", desc: "UK industry partners contributed real-world best-practice insights." }, { title: "People-Centred Capacity Building", desc: "Lasting human connections between UK and Bangladeshi communities." }, { title: "Sustained Future Engagement", desc: "Structured for longevity — supporting future cohorts and collaborative research." }] } }
    ] },
    { id: "contact", label: "Contact Page", slug: "/contact", sections: [
      { id: "contact_hero", type: "contact_hero", title: "Page Header", order: 0, visible: true, content: { badge: "Get in Touch", title: "Academic Offices", description: "Direct queries to our partner researchers for administrative verification or credit transfers." } },
      { id: "contact_info", type: "contact_info", title: "Contact Information", order: 1, visible: true, content: { aiub_address: "AIUB Campus, Bashundhara, Dhaka 1229, Bangladesh", bcu_address: "Birmingham City University, Birmingham, B4 7XG, United Kingdom", email: "info@digitalmanufacturing.academy", phone: "+880 2-9884455", phone2: "+44 (0)121 331 5000" } },
      { id: "contact_form", type: "contact_form", title: "Contact Form", order: 2, visible: true, content: { formTitle: "Send us a message", formDescription: "Fill out the form and our academic liaison team will respond within 2 business days.", submitLabel: "Send Enquiry" } }
    ] }
  ]
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    let cms = await prisma.cmsContent.findUnique({ where: { id: "main" } });
    if (!cms) {
      cms = await prisma.cmsContent.create({ data: { id: "main", pages: DEFAULT_CMS.pages as any } });
    }
    res.json(cms);
  } catch {
    res.json({ pages: DEFAULT_CMS.pages });
  }
});

router.post("/update", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const { cmsData } = req.body;
  if (!cmsData) return res.status(400).json({ error: "cmsData required" }) as any;
  await prisma.cmsContent.upsert({
    where: { id: "main" },
    create: { id: "main", pages: cmsData.pages || cmsData },
    update: { pages: cmsData.pages || cmsData },
  });
  res.json({ status: "success" });
});

router.get("/theme", async (_req: Request, res: Response) => {
  const theme = await prisma.themeSetting.findUnique({ where: { id: "main" } });
  res.json(theme?.settings || null);
});

router.post("/theme", async (req: Request, res: Response) => {
  const session = await requireAdmin(req, res);
  if (!session) return;
  const settings = req.body;
  if (!settings || typeof settings !== "object") return res.status(400).json({ error: "Valid theme settings object required" }) as any;
  await prisma.themeSetting.upsert({
    where: { id: "main" },
    create: { id: "main", settings },
    update: { settings },
  });
  res.json({ status: "success" });
});

export default router;
