const { scrapeGroups } = require("./sources/wikipedia");
const {
  generateResults,
  computeStandingsFromMatches,
  KNOCKOUT_MATCH_NUMS,
} = require("./generate-results");

const GROUP_NAMES = [
  "A", "B", "C", "D", "E", "F",
  "G", "H", "I", "J", "K", "L",
];
const CURRENT_YEAR = 2026;

async function scrapeKnockout() {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${CURRENT_YEAR}_FIFA_World_Cup_knockout_stage&prop=text&format=json&origin=*`;
    const res = await fetch(url, {
      headers: { "User-Agent": "worldcup2026-scraper/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.parse?.text) return null;

    const html = data.parse.text["*"];
    const cheerio = require("cheerio");
    const $ = cheerio.load(html);

    const knockout = {
      round32: [],
      round16: [],
      quarterfinals: [],
      semifinals: [],
      round32Winners: [],
      round16Winners: [],
      quarterfinalsWinners: [],
      semifinalsWinners: [],
      champion: "",
      runnerUp: "",
      finalists: [],
      thirdPlaceWinner: "",
      final: "",
      thirdPlace: "",
      finalMatch: [],
      thirdPlaceMatch: [],
    };

    const $knockoutBox = $(".footballbox");

    $knockoutBox.each((i, el) => {
      const $el = $(el);
      const homeLink = $el.find(".fhome a").first();
      const awayLink = $el.find(".faway a").first();
      const scoreEl = $el.find(".fscore");

      if (!homeLink.length || !awayLink.length || !scoreEl.length) return;

      const home = homeLink.text().trim();
      const away = awayLink.text().trim();
      const scoreText = scoreEl.text().trim();
      const scoreMatch = scoreText.match(/(\d+)\s*[–\-]\s*(\d+)/);
      if (!scoreMatch) return;

      const homeGoals = parseInt(scoreMatch[1], 10);
      const awayGoals = parseInt(scoreMatch[2], 10);
      if (isNaN(homeGoals) || isNaN(awayGoals)) return;

      const matchNum = KNOCKOUT_MATCH_NUMS.round32[i];
      if (!matchNum) return;

      const winner = homeGoals > awayGoals ? home : away;
      knockout.round32.push({
        match: matchNum,
        team1: home,
        team2: away,
        winner,
      });
    });

    if (knockout.round32.length === 16) {
      knockout.round32Winners = knockout.round32.map((m) => m.winner);
    }

    return knockout;
  } catch (err) {
    console.log("Knockout stage page not available yet:", err.message);
    return null;
  }
}

async function main() {
  console.log("=== World Cup 2026 Results Scraper ===\n");

  const groupData = await scrapeGroups(GROUP_NAMES, CURRENT_YEAR);
  console.log(
    `\nGroups with results: ${groupData.groupsCompleted}/${GROUP_NAMES.length}`,
  );

  if (groupData.groupsCompleted === 0) {
    console.log("No group data found. Skipping results generation.");
    return;
  }

  const standings = computeStandingsFromMatches(
    groupData.matches,
    GROUP_NAMES,
  );

  let knockout = null;
  if (groupData.groupsCompleted >= 12) {
    knockout = await scrapeKnockout();
    if (knockout) {
      console.log(
        `Knockout: ${knockout.round32.length} matches found (round32)`,
      );
    }
  }

  generateResults(groupData.matches, standings, knockout);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Scraper failed:", err);
  process.exit(1);
});
