const rp = require("request-promise");
const checksum = require("checksum");
const co = require("cheerio");
// const twilio = require(twilio);
const accountID = "AC007785155799a5b1506f83cd0d29e35b";
const authKey = "38809f0793da125d60282aed4f252c70";

// Instantiate Twilio - you'll need to get your own credentials for this one!
const client = require('twilio')(accountID, authKey);


// instantiate an empty variable outside the function so we can save its value
let hash = "";

const url = `https://www.kijiji.ca/b-appartement-condo-4-1-2/grand-montreal/plateau/k0c214l80002?price=__1200`;


function checkURL(siteToCheck) {
  return rp(siteToCheck)
    .then(HTMLresponse => {
      const $ = co.load(HTMLresponse);
      let apartmentString = "";

      // use cheerio to parse HTML response and find all search results
      // then find all apartmentlistingIDs and concatenate them
      $(".search-item.regular-ad").each((i, element) => {
         apartmentString += `${element.attribs["data-ad-id"]}`;
       });

       if (hash === '') {
         console.log('Making initial fetch...')
         hash = checksum(apartmentString);
       }

       // When the hashes are not equal, there is a change in ad ID's
       if (checksum(apartmentString) !== hash) {
         hash = checksum(apartmentString)
         return true;
       }

       console.log('No change to report!')
       return false;
     })
     .catch(err => {
       console.log(`Could not complete fetch of ${url}: ${err}`);
     });
 }


// you'll need to get your own credentials for this one
function SMS({
 body,
 to,
 from
}) {
 client.messages
   .create({
     body,
     to,
     from
   })
   .then(() => {
     console.log(`👍 Success! Message has been sent to ${to}`);
   })
   .catch(err => {
     console.log(err);
   });
}

// check every 10 seconds
// doing this asynchonously so our fetch  is sure to resolve
setInterval(async () => {
  // if checkURL returns true, send a message!

  if (await checkURL(url)) {
    console.log('Found a change! Sending SMS...')
    // These are obviously fake phone numbers, replace the `to` with whatever number you want to message
    // and the from with the number from your Twilio account!
    SMS({
      body: `There is a new add at ${url}!`,
      to: "+27732532693",
      from: "+18602001640"
    });
  }
}, 10000);
