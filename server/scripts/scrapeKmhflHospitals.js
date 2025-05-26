"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer_1 = __importDefault(require("puppeteer"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, browser, page, hospitals, hasNext, pageNum, hospitalRows, i, basicInfo, detailedInfo, hospitalInfo, closeButton, error_1, nextBtn, isDisabled, outPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = 'https://kmhfr.health.go.ke/facilities/';
                return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    })];
            case 1:
                browser = _a.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _a.sent();
                // Set viewport to ensure all elements are visible
                return [4 /*yield*/, page.setViewport({ width: 1920, height: 1080 })];
            case 3:
                // Set viewport to ensure all elements are visible
                _a.sent();
                // Enable request interception to block unnecessary resources
                return [4 /*yield*/, page.setRequestInterception(true)];
            case 4:
                // Enable request interception to block unnecessary resources
                _a.sent();
                page.on('request', function (request) {
                    if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                        request.abort();
                    }
                    else {
                        request.continue();
                    }
                });
                console.log('Navigating to KMHFL website...');
                return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })];
            case 5:
                _a.sent();
                hospitals = [];
                hasNext = true;
                pageNum = 1;
                _a.label = 6;
            case 6:
                if (!hasNext) return [3 /*break*/, 28];
                console.log("Processing page ".concat(pageNum, "..."));
                // Wait for table to load
                return [4 /*yield*/, page.waitForSelector('table#DataTables_Table_0')];
            case 7:
                // Wait for table to load
                _a.sent();
                return [4 /*yield*/, page.$$('table#DataTables_Table_0 tbody tr')];
            case 8:
                hospitalRows = _a.sent();
                i = 0;
                _a.label = 9;
            case 9:
                if (!(i < hospitalRows.length)) return [3 /*break*/, 21];
                _a.label = 10;
            case 10:
                _a.trys.push([10, 19, , 20]);
                // Click on the hospital row to open details
                return [4 /*yield*/, hospitalRows[i].click()];
            case 11:
                // Click on the hospital row to open details
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(1000)];
            case 12:
                _a.sent(); // Wait for modal to load
                return [4 /*yield*/, page.evaluate(function (row) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                        var tds = Array.from(row.querySelectorAll('td'));
                        return {
                            code: ((_b = (_a = tds[0]) === null || _a === void 0 ? void 0 : _a.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '',
                            name: ((_d = (_c = tds[1]) === null || _c === void 0 ? void 0 : _c.textContent) === null || _d === void 0 ? void 0 : _d.trim()) || '',
                            county: ((_f = (_e = tds[2]) === null || _e === void 0 ? void 0 : _e.textContent) === null || _f === void 0 ? void 0 : _f.trim()) || '',
                            type: ((_h = (_g = tds[3]) === null || _g === void 0 ? void 0 : _g.textContent) === null || _h === void 0 ? void 0 : _h.trim()) || '',
                            status: ((_k = (_j = tds[4]) === null || _j === void 0 ? void 0 : _j.textContent) === null || _k === void 0 ? void 0 : _k.trim()) || ''
                        };
                    }, hospitalRows[i])];
            case 13:
                basicInfo = _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var modal = document.querySelector('.modal-content');
                        if (!modal)
                            return {};
                        var getText = function (selector) {
                            var _a;
                            var el = modal.querySelector(selector);
                            return el ? (_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim() : '';
                        };
                        return {
                            ownership: getText('.ownership'),
                            level: getText('.level'),
                            beds: getText('.beds'),
                            services: getText('.services'),
                            address: getText('.address'),
                            phone: getText('.phone'),
                            email: getText('.email'),
                            website: getText('.website'),
                            latitude: getText('.latitude'),
                            longitude: getText('.longitude'),
                            operatingHours: getText('.operating-hours'),
                            emergencyServices: getText('.emergency-services'),
                            insuranceAccepted: getText('.insurance'),
                            specialties: getText('.specialties'),
                            accreditation: getText('.accreditation'),
                            lastUpdated: getText('.last-updated')
                        };
                    })];
            case 14:
                detailedInfo = _a.sent();
                hospitalInfo = __assign(__assign(__assign({}, basicInfo), detailedInfo), { scrapedAt: new Date().toISOString() });
                hospitals.push(hospitalInfo);
                console.log("Scraped details for: ".concat(hospitalInfo.name));
                return [4 /*yield*/, page.$('.modal .close')];
            case 15:
                closeButton = _a.sent();
                if (!closeButton) return [3 /*break*/, 18];
                return [4 /*yield*/, closeButton.click()];
            case 16:
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(500)];
            case 17:
                _a.sent();
                _a.label = 18;
            case 18: return [3 /*break*/, 20];
            case 19:
                error_1 = _a.sent();
                console.error("Error scraping hospital at index ".concat(i, ":"), error_1);
                return [3 /*break*/, 20];
            case 20:
                i++;
                return [3 /*break*/, 9];
            case 21: return [4 /*yield*/, page.$('a#DataTables_Table_0_next')];
            case 22:
                nextBtn = _a.sent();
                return [4 /*yield*/, page.$eval('a#DataTables_Table_0_next', function (el) { return el.classList.contains('disabled'); })];
            case 23:
                isDisabled = _a.sent();
                if (!(nextBtn && !isDisabled)) return [3 /*break*/, 26];
                return [4 /*yield*/, nextBtn.click()];
            case 24:
                _a.sent();
                return [4 /*yield*/, page.waitForTimeout(2000)];
            case 25:
                _a.sent(); // Wait for table to update
                pageNum++;
                return [3 /*break*/, 27];
            case 26:
                hasNext = false;
                _a.label = 27;
            case 27: return [3 /*break*/, 6];
            case 28: return [4 /*yield*/, browser.close()];
            case 29:
                _a.sent();
                outPath = path_1.default.join(__dirname, 'kmhfl_hospitals_detailed.json');
                fs_1.default.writeFileSync(outPath, JSON.stringify(hospitals, null, 2));
                console.log("\nScraping completed!");
                console.log("Total hospitals scraped: ".concat(hospitals.length));
                console.log("Data saved to: ".concat(outPath));
                return [2 /*return*/];
        }
    });
}); })();
