const cheerio = require("cheerio");

const TEAM_NAME_MAP = {
  "United States": "USA",
  "Korea Republic": "South Korea",
  "Korea DPR": "South Korea",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "Côte d'Ivoire": "Ivory Coast",
};

function normalizeTeamName(name) {
  name = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  return TEAM_NAME_MAP[name] || name;
}

function groupMatchKey(team1, team2) {
  return [team1, team2].sort().join("__");
}

async function fetchGroupPage(groupLetter, year = 2026) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${year}_FIFA_World_Cup_Group_${groupLetter}&prop=text&format=json&origin=*`;
  const res = await fetch(url, {
    headers: { "User-Agent": "worldcup2026-scraper/1.0" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.parse?.text) return null;
  return data.parse.text["*"];
}

function parseMatches(html) {
  const $ = cheerio.load(html);
  const matchResults = [];

  $(".footballbox").each((i, el) => {
    const $el = $(el);
    const homeLink = $el.find(".fhome a").first();
    const awayLink = $el.find(".faway a").first();
    const scoreEl = $el.find(".fscore");

    if (!homeLink.length || !awayLink.length || !scoreEl.length) return;

    const home = normalizeTeamName(homeLink.text().trim());
    const away = normalizeTeamName(awayLink.text().trim());
    const scoreText = scoreEl.text().trim();

    const scoreMatch = scoreText.match(/(\d+)\s*[–\-]\s*(\d+)/);
    if (!scoreMatch) return;

    const homeGoals = parseInt(scoreMatch[1], 10);
    const awayGoals = parseInt(scoreMatch[2], 10);
    if (isNaN(homeGoals) || isNaN(awayGoals)) return;

    matchResults.push({
      team1: home,
      team2: away,
      homeGoals,
      awayGoals,
    });
  });

  return matchResults;
}

function parseStandings(html) {
  const $ = cheerio.load(html);
  const standings = [];

  $("table.wikitable").each((tableIdx, table) => {
    if (tableIdx !== 1) return;

    $(table)
      .find("tbody tr")
      .each((i, el) => {
        const $firstChild = $(el).children().first();
        const pos = parseInt($firstChild.text().trim(), 10);
        if (isNaN(pos)) return;

        const teamEl = $(el).find('th[scope="row"]').first();
        if (!teamEl.length) return;

        const teamLink = teamEl.find("a").first();
        if (teamLink.length) {
          standings.push(normalizeTeamName(teamLink.text().trim()));
        }
      });
  });

  return standings;
}

function matchResultToKeyValue(matchResult, team1, team2) {
  const { team1: rTeam1, team2: rTeam2, homeGoals, awayGoals } = matchResult;

  if (rTeam1 === team1 && rTeam2 === team2) {
    return { home: homeGoals, away: awayGoals };
  }
  if (rTeam1 === team2 && rTeam2 === team1) {
    return { home: awayGoals, away: homeGoals };
  }

  return null;
}

async function scrapeGroups(groups, year = 2026) {
  const allGroupMatches = {};
  const allStandings = {};
  const allTeamLists = {};
  let groupsCompleted = 0;

  for (const group of groups) {
    try {
      const html = await fetchGroupPage(group, year);
      if (!html) {
        console.log(`  Group ${group}: page not available yet, skipping`);
        continue;
      }

      const wikiMatches = parseMatches(html);
      const standings = parseStandings(html);

      if (standings.length > 0) {
        allStandings[group] = standings;
        allTeamLists[group] = standings;
      }

      if (wikiMatches.length > 0) {
        const groupMatchMap = {};
        const orderedTeams = standings;

        if (orderedTeams.length >= 4) {
          for (let i = 0; i < orderedTeams.length; i++) {
            for (let j = i + 1; j < orderedTeams.length; j++) {
              const t1 = orderedTeams[i];
              const t2 = orderedTeams[j];
              const key = groupMatchKey(t1, t2);

              const wikiResult = wikiMatches.find((rm) => {
                const n1 = normalizeTeamName(rm.team1);
                const n2 = normalizeTeamName(rm.team2);
                return (
                  (n1 === t1 && n2 === t2) || (n1 === t2 && n2 === t1)
                );
              });

              if (wikiResult) {
                const kv = matchResultToKeyValue(wikiResult, t1, t2);
                if (kv) {
                  groupMatchMap[key] = kv;
                }
              }
            }
          }
        } else {
          for (const wm of wikiMatches) {
            const n1 = normalizeTeamName(wm.team1);
            const n2 = normalizeTeamName(wm.team2);
            const key = groupMatchKey(n1, n2);
            groupMatchMap[key] = { home: wm.homeGoals, away: wm.awayGoals };
          }
        }

        allGroupMatches[group] = groupMatchMap;
        groupsCompleted++;
        console.log(
          `  Group ${group}: ${Object.keys(groupMatchMap).length} matches parsed`,
        );
      }
    } catch (err) {
      console.error(`  Error scraping group ${group}:`, err.message);
    }
  }

  return {
    matches: allGroupMatches,
    standings: allStandings,
    groupsCompleted,
    teamLists: allTeamLists,
  };
}

module.exports = { scrapeGroups, groupMatchKey };
