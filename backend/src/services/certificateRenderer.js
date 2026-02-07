import puppeteer from "puppeteer";
import QRCode from "qrcode";

export async function renderCertificatePDF(templateHtml, data) {
  const qrDataUrl = await QRCode.toDataURL(data.verify_url);

  let html = templateHtml;
  for (const [key, value] of Object.entries({
    ...data,
    qr_data_url: qrDataUrl,
  })) {
    html = html.replaceAll(`{{${key}}}`, value ?? "");
  }

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return pdf;
}
