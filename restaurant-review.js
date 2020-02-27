/* Part 1 */

const puppeteer = require("puppeteer");

puppeteer
  .launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--window-size=1920,1080"
    ]
  })
  .then(async browser => {
    const page = await browser.newPage();
    await page.goto(
      "https://www.tripadvisor.com/Restaurant_Review-g60763-d15873406-Reviews-Ortomare_Ristorante_Pizzeria-New_York_City_New_York.html"
    );
    await page.waitForSelector("body");

    /* Part 2 */

    await page.click(".taLnk.ulBlueLinks");
    await page.waitForFunction(
      'document.querySelector("body").innerText.includes("Show less")'
    );

    /* Part 3 */

    var reviews = await page.evaluate(() => {
      var results = [];

      var items = document.body.querySelectorAll(".review-container");
      items.forEach(item => {
        /* Get and format Rating */
        let ratingElement = item
          .querySelector(".ui_bubble_rating")
          .getAttribute("class");
        let integer = ratingElement.replace(/[^0-9]/g, "");
        let parsedRating = parseInt(integer) / 10;

        /* Get and format date of Visit */
        let dateOfVisitElement = item.querySelector(
          ".prw_rup.prw_reviews_stay_date_hsx"
        ).innerText;
        let parsedDateOfVisit = dateOfVisitElement
          .replace("Date of visit:", "")
          .trim();

        /* Part 4 */

        results.push({
          rating: parsedRating,
          dateOfVisit: parsedDateOfVisit,
          ratingDate: item.querySelector(".ratingDate").getAttribute("title"),
          title: item.querySelector(".noQuotes").innerText,
          content: item.querySelector(".partial_entry").innerText
        });
      });
      return results;
    });
    console.log(reviews);
    await browser.close();
  })
  .catch(function(error) {
    console.error(error);
  });
