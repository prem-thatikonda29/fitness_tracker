package com.fittracker.tests;

import com.fittracker.BaseTest;
import com.fittracker.pages.LogWorkoutPage;
import com.fittracker.pages.SessionPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LogWorkoutTest extends BaseTest {

    @Test
    public void testLogFullWorkout() {
        System.out.println("[TEST] testLogFullWorkout started");
        signIn();

        LogWorkoutPage logPage = new LogWorkoutPage(driver, config.getWaitTimeout());
        logPage.navigate(config.getBaseUrl());
        System.out.println("[TEST] On /log page");

        logPage.enterSessionName("Chest Day Test");
        System.out.println("[TEST] Entered session name");

        logPage.selectExercise("Bench Press");
        System.out.println("[TEST] Selected Bench Press exercise");

        logPage.enterSet("Bench Press", 0, "10", "60");
        System.out.println("[TEST] Filled set 0: 10 reps, 60 kg");

        logPage.clickAddSet();
        System.out.println("[TEST] Added second set");

        logPage.enterSet("Bench Press", 1, "8", "65");
        System.out.println("[TEST] Filled set 1: 8 reps, 65 kg");

        logPage.clickSave();
        System.out.println("[TEST] Clicked save, waiting for redirect...");

        SessionPage sessionPage = new SessionPage(driver, config.getWaitTimeout());
        sessionPage.waitForLoad();
        System.out.println("[TEST] Landed on session page. URL: " + driver.getCurrentUrl());

        Assert.assertTrue(sessionPage.isCurrentUrlSessionPage(),
                "Should be on session page after saving workout");
        Assert.assertTrue(sessionPage.getSessionTitle().contains("Chest Day Test"),
                "Session title should contain the workout name");
        Assert.assertTrue(sessionPage.getBodypartBadgeCount() >= 1,
                "Should have at least one body part badge");
        Assert.assertTrue(sessionPage.isExerciseCardVisible("Bench Press"),
                "Bench Press exercise card should be visible on session page");
        System.out.println("[TEST] testLogFullWorkout PASSED");
    }
}
