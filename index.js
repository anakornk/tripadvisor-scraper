/* Part 1 */

const puppeteer = require("puppeteer");
const fs = require("fs");

let scrapePage = async page => {
  let reviews = await page.evaluate(async () => {
    var results = [];

    var items = document.body.querySelectorAll(
      ".hotels-community-tab-common-Card__card--ihfZB.hotels-community-tab-common-Card__section--4r93H"
    );

    items.forEach(item => {
      item
        .querySelector(
          ".location-review-review-list-parts-ExpandableReview__cta--2mR2g"
        )
        .click();
      // await page.waitForFunction(
      // 'document.querySelector("body").innerText.includes("Read less")'
      // );

      let result = {};

      /* Get and format Rating */
      let ratingElement = item
        .querySelector(".ui_bubble_rating")
        .getAttribute("class");
      let integer = ratingElement.replace(/[^0-9]/g, "");
      let parsedRating = parseInt(integer) / 10;
      result.rating = parsedRating;

      // Date of stay
      let dateOfStayElement = item.querySelector(
        ".location-review-review-list-parts-EventDate__event_date--1epHa"
      );
      let parsedDateOfStay = "n/a";
      if (dateOfStayElement) {
        parsedDateOfStay = dateOfStayElement.innerText
          .replace("Date of stay:", "")
          .trim();
      }

      result.dateOfStay = parsedDateOfStay;

      let additionalRatingsElement = item.querySelectorAll(
        ".location-review-review-list-parts-AdditionalRatings__large--IOg2u"
      );
      additionalRatingsElement.forEach(additionalRating => {
        if (!additionalRating) {
          return;
        }
        let key = additionalRating.innerText.split(" ")[0].toLowerCase();
        let tempValue = additionalRating.firstElementChild.firstElementChild.className.replace(
          /[^0-9]/g,
          ""
        );
        let value = parseInt(tempValue) / 10;
        result[key] = value;
      });

      // reviewer
      let reviewerElement = item.querySelector(
        ".ui_header_link.social-member-event-MemberEventOnObjectBlock__member--35-jC"
      );
      let reviewer = "n/a";
      if (reviewerElement) {
        reviewer = reviewerElement.innerText;
      }
      result.reviewer = reviewer;

      let reviewDateElement = item.querySelector(
        ".social-member-event-MemberEventOnObjectBlock__event_type--3njyv"
      );
      let reviewDate = "n/a";
      if (reviewDateElement) {
        let reviewDateTemp = reviewDateElement.innerText.split(" ");
        let length = reviewDateTemp.length;

        reviewDate =
          reviewDateTemp[length - 2] + " " + reviewDateTemp[length - 1];
      }
      result.reviewDate = reviewDate;

      let hometownElement = item.querySelector(
        ".default.social-member-common-MemberHometown__hometown--3kM9S"
      );
      let hometown = "n/a";
      if (hometownElement) {
        hometown = hometownElement.innerText;
      }
      result.hometown = hometown;

      let title = "n/a";
      let titleElement = item.querySelector(
        ".location-review-review-list-parts-ReviewTitle__reviewTitle--2GO9Z"
      );
      if (titleElement) {
        title = titleElement.innerText;
      }
      result.title = title;

      let content = "n/a";
      let contentElement = item.querySelector(
        ".location-review-review-list-parts-ExpandableReview__reviewText--gOmRC"
      );
      if (contentElement) {
        content = contentElement.innerText;
      }
      result.content = content;

      /* Part 4 */

      results.push(result);
    });
    return results;
  });

  return reviews;
};

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
      "https://www.tripadvisor.com/Hotel_Review-g56003-d641273-Reviews-Hotel_ZaZa_Houston_Museum_District-Houston_Texas.html"
    );
    await page.waitForSelector("body");

    /* Part 2 */

    // await page.click(
    //   ".location-review-review-list-parts-ExpandableReview__cta--2mR2g"
    // );
    // await page.waitForFunction(
    //   'document.querySelector("body").innerText.includes("Read less")'
    // );

    /* Part 3 */

    var results = []; // variable to hold collection of all book titles and prices
    var lastPageNumber = 397; // this is hardcoded last catalogue page, you can set it dunamically if you wish
    // defined simple loop to iterate over number of catalogue pages
    for (let index = 0; index < lastPageNumber; index++) {
      // wait 1 sec for page load
      await page.waitFor(1000);
      // call and wait extractedEvaluateCall and concatenate results every iteration.
      // You can use results.push, but will get collection of collections at the end of iteration
      try {
        let pageResult = await scrapePage(page);

        //   console.log(pageResult);
        results = results.concat(pageResult);
      } catch (e) {
        console.log(e);
      }

      // this is where next button on page clicked to jump to another page
      if (index != lastPageNumber - 1) {
        // no next button on last page
        await page.click(".ui_button.nav.next.primary");
      }
      console.log(index);
    }

    // var reviews = await scrapePage(page);
    // console.log(reviews);

    // await page.click(".ui_button.nav.next.primary");
    // await page.waitFor(1000);

    // var reviews2 = await scrapePage(page);
    // console.log(reviews2);

    // writeToCsv
    let keys = [
      "reviewer",
      "hometown",
      "reviewDate",
      "dateOfStay",
      "title",
      "content",
      "rating",
      "value",
      "location",
      "service",
      "rooms",
      "cleanliness",
      "sleep",
      "check",
      "business"
    ];
    var stream = fs.createWriteStream("hotel3.csv");
    stream.once("open", function(fd) {
      //write header
      stream.write(keys.join(",") + "\n");
      results.forEach(review => {
        let str = review[keys[0]];
        for (let i = 1; i < keys.length; i++) {
          if (review[keys[i]]) {
            str += ',"' + review[keys[i]].toString().replace(/"/g, "'") + '"';
          } else {
            str += ',"n/a"';
          }
        }
        str += "\n";

        stream.write(str);
      });
      stream.end();
    });

    // console.log(results);
    await browser.close();
  })
  .catch(function(error) {
    console.error(error);
  });
