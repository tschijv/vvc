import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const pageLoadTime = new Trend("page_load_time");

// Test configuration
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    // Scenario 1: Smoke test (baseline)
    smoke: {
      executor: "constant-vus",
      vus: 5,
      duration: "30s",
      startTime: "0s",
      tags: { scenario: "smoke" },
    },
    // Scenario 2: Normal load (350 gemeenten, ~50 concurrent)
    normal_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 50 },
        { duration: "30s", target: 0 },
      ],
      startTime: "35s",
      tags: { scenario: "normal" },
    },
    // Scenario 3: Spike test (plotselinge piek)
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 100 },
        { duration: "30s", target: 100 },
        { duration: "10s", target: 0 },
      ],
      startTime: "3m",
      tags: { scenario: "spike" },
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"], // 95% of requests under 2s
    errors: ["rate<0.05"], // Error rate under 5%
    page_load_time: ["p(95)<3000"], // Page load under 3s
  },
};

// Simulate realistic user journeys
export default function () {
  const journeys = [browsePublic, browseGemeenten, browsePakketten, useAPI];
  const journey = journeys[Math.floor(Math.random() * journeys.length)];
  journey();
}

// Journey 1: Anonymous user browsing public pages
function browsePublic() {
  let res;

  // Homepage
  res = http.get(`${BASE_URL}/`);
  check(res, { "homepage 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Pakketten overzicht
  res = http.get(`${BASE_URL}/pakketten`);
  check(res, { "pakketten 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Leveranciers
  res = http.get(`${BASE_URL}/leveranciers`);
  check(res, { "leveranciers 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Standaarden
  res = http.get(`${BASE_URL}/standaarden`);
  check(res, { "standaarden 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(0.5);
}

// Journey 2: User browsing gemeenten
function browseGemeenten() {
  let res;

  // Gemeenten overzicht
  res = http.get(`${BASE_URL}/gemeenten`);
  check(res, { "gemeenten 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Zoeken
  res = http.get(`${BASE_URL}/gemeenten?zoek=amsterdam`);
  check(res, { "gemeenten zoek 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Vergelijken
  res = http.get(`${BASE_URL}/gemeenten/vergelijk`);
  check(res, { "vergelijk 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(0.5);
}

// Journey 3: User browsing pakketten
function browsePakketten() {
  let res;

  // Pakketten overzicht
  res = http.get(`${BASE_URL}/pakketten`);
  check(res, { "pakketten 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Zoeken met filter
  res = http.get(`${BASE_URL}/pakketten?zoek=open`);
  check(res, { "pakketten zoek 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(1);

  // Compliancy monitor
  res = http.get(`${BASE_URL}/compliancy`);
  check(res, { "compliancy 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  pageLoadTime.add(res.timings.duration);
  sleep(0.5);
}

// Journey 4: API usage
function useAPI() {
  let res;

  // Gemeenten API
  res = http.get(`${BASE_URL}/api/v1/gemeenten?limit=25`);
  check(res, {
    "api gemeenten 200": (r) => r.status === 200,
    "api gemeenten has data": (r) => JSON.parse(r.body).data.length > 0,
  });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Leveranciers API
  res = http.get(`${BASE_URL}/api/v1/leveranciers?limit=25`);
  check(res, { "api leveranciers 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Standaarden API
  res = http.get(`${BASE_URL}/api/v1/standaarden`);
  check(res, { "api standaarden 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.5);

  // Referentiecomponenten API
  res = http.get(`${BASE_URL}/api/v1/referentiecomponenten`);
  check(res, { "api refcomps 200": (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  sleep(0.3);
}
