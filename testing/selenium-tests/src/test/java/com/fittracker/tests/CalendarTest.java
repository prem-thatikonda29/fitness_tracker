package com.fittracker.tests;

import com.fittracker.BaseTest;
import com.fittracker.pages.CalendarPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CalendarTest extends BaseTest {

    @Test
    public void testCalendarDisplaysAfterLogin() {
        System.out.println("[TEST] testCalendarDisplaysAfterLogin started");
        signIn();

        CalendarPage calendarPage = new CalendarPage(driver, config.getWaitTimeout());
        calendarPage.navigate(config.getBaseUrl());

        Assert.assertTrue(calendarPage.isMonthTitleVisible(), "Month title should be visible");
        Assert.assertTrue(calendarPage.isCalendarGridVisible(), "Calendar grid should be visible");
        Assert.assertTrue(calendarPage.isWeekSummaryVisible(), "Week summary should be visible");
        Assert.assertTrue(calendarPage.isLogWorkoutBtnVisible(), "Log workout button should be visible");

        String before = calendarPage.getMonthTitle();
        calendarPage.clickPrevMonth();
        calendarPage.clickNextMonth();
        Assert.assertEquals(calendarPage.getMonthTitle(), before,
                "Month title should be the same after prev + next navigation");
        System.out.println("[TEST] testCalendarDisplaysAfterLogin PASSED");
    }
}
