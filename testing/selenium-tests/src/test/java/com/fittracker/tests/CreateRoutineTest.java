package com.fittracker.tests;

import com.fittracker.BaseTest;
import com.fittracker.pages.RoutinesPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CreateRoutineTest extends BaseTest {

    @Test
    public void testCreateRoutine() {
        System.out.println("[TEST] testCreateRoutine started");
        signIn();

        RoutinesPage routinesPage = new RoutinesPage(driver, config.getWaitTimeout());
        routinesPage.navigate(config.getBaseUrl());
        System.out.println("[TEST] On /routines page");

        Assert.assertTrue(routinesPage.getRoutineCardCount() >= 1,
                "Should have at least one seeded routine");
        System.out.println("[TEST] Found seeded routines: " + routinesPage.getRoutineCardCount());

        routinesPage.clickNewRoutine();
        System.out.println("[TEST] Clicked New Routine, navigating to /routines/new...");

        routinesPage.enterRoutineName("Morning Pump");
        System.out.println("[TEST] Entered routine name 'Morning Pump'");

        routinesPage.selectSplit("Standard split");
        System.out.println("[TEST] Selected split type 'Standard split'");

        routinesPage.toggleExercise("Bench Press");
        routinesPage.toggleExercise("Overhead Press");
        System.out.println("[TEST] Toggled exercises: Bench Press, Overhead Press");

        routinesPage.clickSave();
        System.out.println("[TEST] Saved routine, waiting for redirect...");

        // Wait for the server action redirect to complete
        try {
            wait.until(org.openqa.selenium.support.ui.ExpectedConditions.urlContains("/routines"));
            System.out.println("[TEST] Redirected to /routines. URL: " + driver.getCurrentUrl());
        } catch (Exception e) {
            System.out.println("[TEST] Redirect timeout. URL: " + driver.getCurrentUrl());
        }

        Assert.assertTrue(
                driver.getCurrentUrl().contains("/routines"),
                "Should redirect to routines list after saving");

        Assert.assertTrue(routinesPage.isRoutineVisible("Morning Pump"),
                "Newly created routine should be visible in the list");
        System.out.println("[TEST] testCreateRoutine PASSED");
    }
}
