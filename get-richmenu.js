// get-richmenu.js
import axios from "axios";

const CHANNEL_ACCESS_TOKEN =
  "JLm4P1apMvfP5em28vcK9r816xU6ItozKb6whRipJ1Hif7xVDKDNIXVnFfl+b62Yi4lbBQUZncJEzypzback4mkJZmAM9fBbK8CjUX8t2PHRrSnsS2OoNaIJXSCGwNgp0jSKlglxvAdeZt8inHXpJwdB04t89/1O/w1cDnyilFU=";

try {
  const res = await axios.get(
    "https://api.line.me/v2/bot/user/all/richmenu",
    {
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );

  console.log("✅ Rich Menu Default:", res.data);
} catch (err) {
  if (err.response) {
    console.error("❌ Error:", err.response.status, err.response.data);
  } else {
    console.error("❌ Unexpected Error:", err.message);
  }
}
