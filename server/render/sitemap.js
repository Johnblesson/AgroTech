const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!-- created with Free Online Sitemap Generator www.xml-sitemaps.com -->
<url>
  <loc>https://www.homehubng.com/</loc>
  <lastmod>2024-08-03T13:35:58+00:00</lastmod>
  <priority>1.00</priority>
</url>
<url>
  <loc>https://www.homehubng.com/login</loc>
  <lastmod>2024-08-03T13:35:58+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://www.homehubng.com/signup</loc>
  <lastmod>2024-08-03T13:35:58+00:00</lastmod>
  <priority>0.64</priority>
</url>
<url>
  <loc>https://www.homehubng.com/privacy-policy</loc>
  <lastmod>2024-08-03T13:35:58+00:00</lastmod>
  <priority>0.80</priority>
</url>

</urlset>`;

export const siteMaps = (req, res) => {
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
}
