const mockHrs = { textContent: "" };
const mockMin = { textContent: "" };
const mockSec = { textContent: "" };

// Mock document.getElementById before the script is loaded,
// as the script calls it immediately to get the elements.
const originalGetElementById = document.getElementById;
document.getElementById = jest.fn((id) => {
  if (id === "hrs") return mockHrs;
  if (id === "min") return mockMin;
  if (id === "sec") return mockSec;
  return null;
});

// Store original global Date and setInterval to restore them later.
const RealDate = Date;
const RealSetInterval = setInterval;

// Mock setInterval before loading the script, as the script calls it immediately.
global.setInterval = jest.fn();

// Load the script. This will:
// 1. Call document.getElementById for hrs, min, sec.
// 2. Define the global updateClock function.
// 3. Call updateClock() once.
// 4. Call setInterval(updateClock, 1000).
require('./script.js');

// The updateClock function is now available in the global scope after `require`.
const updateClock = global.updateClock;

describe('Clock update functionality (script.js)', () => {

  beforeEach(() => {
    // Reset mock elements' content before each test
    mockHrs.textContent = "";
    mockMin.textContent = "";
    mockSec.textContent = "";

    // Use Jest's fake timers to control Date and other time-based functions
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
  });

  afterAll(() => {
    // Restore original Date and setInterval after all tests are done
    global.Date = RealDate;
    global.setInterval = RealSetInterval;
    // Restore original document.getElementById
    document.getElementById = originalGetElementById;
  });

  // Helper function to set a specific time for the mocked Date object
  function setMockTime(hours, minutes, seconds) {
    // Use a fixed date (e.g., Jan 1, 2023) for consistency, only hours, minutes, seconds matter.
    const mockDateInstance = new RealDate(2023, 0, 1, hours, minutes, seconds);
    jest.setSystemTime(mockDateInstance);
  }

  // --- Normal Cases ---

  test('should display single-digit time with leading zeros', () => {
    setMockTime(1, 2, 3); // 01:02:03
    updateClock();
    expect(mockHrs.textContent).toBe("01");
    expect(mockMin.textContent).toBe("02");
    expect(mockSec.textContent).toBe("03");
  });

  test('should display double-digit time without leading zeros', () => {
    setMockTime(11, 22, 33); // 11:22:33
    updateClock();
    expect(mockHrs.textContent).toBe("11");
    expect(mockMin.textContent).toBe("22");
    expect(mockSec.textContent).toBe("33");
  });

  test('should display mixed single and double-digit time correctly', () => {
    setMockTime(9, 10, 11); // 09:10:11
    updateClock();
    expect(mockHrs.textContent).toBe("09");
    expect(mockMin.textContent).toBe("10");
    expect(mockSec.textContent).toBe("11");
  });

  // --- Edge Cases ---

  test('should display 00:00:00 correctly (minimum values)', () => {
    setMockTime(0, 0, 0); // Midnight
    updateClock();
    expect(mockHrs.textContent).toBe("00");
    expect(mockMin.textContent).toBe("00");
    expect(mockSec.textContent).toBe("00");
  });

  test('should display 09:09:09 correctly (largest single-digit)', () => {
    setMockTime(9, 9, 9);
    updateClock();
    expect(mockHrs.textContent).toBe("09");
    expect(mockMin.textContent).toBe("09");
    expect(mockSec.textContent).toBe("09");
  });

  test('should display 10:10:10 correctly (smallest double-digit)', () => {
    setMockTime(10, 10, 10);
    updateClock();
    expect(mockHrs.textContent).toBe("10");
    expect(mockMin.textContent).toBe("10");
    expect(mockSec.textContent).toBe("10");
  });

  test('should display 23:59:59 correctly (maximum values)', () => {
    setMockTime(23, 59, 59); // Just before midnight
    updateClock();
    expect(mockHrs.textContent).toBe("23");
    expect(mockMin.textContent).toBe("59");
    expect(mockSec.textContent).toBe("59");
  });

  // --- Invalid Inputs / Error Cases ---

  test('should call setInterval once on script load with correct arguments', () => {
    // The setInterval call happens when the script is initially loaded via `require()`.
    // We mocked setInterval in `beforeAll`, so we can check if it was called.
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  test('should throw TypeError if "hrs" element is null during updateClock execution', () => {
    // Simulate a scenario where the global 'hrs' variable is null when `updateClock` runs.
    // This could happen if the element was removed from the DOM or initial `getElementById` failed.
    const originalGlobalHrs = global.hrs;
    global.hrs = null; // Temporarily set the global 'hrs' variable to null

    expect(() => updateClock()).toThrow(TypeError);
    expect(() => updateClock()).toThrow("Cannot set properties of null (setting 'textContent')");

    global.hrs = originalGlobalHrs; // Restore global 'hrs'
  });

  test('should throw TypeError if "min" element is null during updateClock execution', () => {
    const originalGlobalMin = global.min;
    global.min = null;

    expect(() => updateClock()).toThrow(TypeError);
    expect(() => updateClock()).toThrow("Cannot set properties of null (setting 'textContent')");

    global.min = originalGlobalMin;
  });

  test('should throw TypeError if "sec" element is null during updateClock execution', () => {
    const originalGlobalSec = global.sec;
    global.sec = null;

    expect(() => updateClock()).toThrow(TypeError);
    expect(() => updateClock()).toThrow("Cannot set properties of null (setting 'textContent')");

    global.sec = originalGlobalSec;
  });
});