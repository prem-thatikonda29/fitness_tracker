package com.fittracker.tests;

import com.fittracker.BaseTest;
import com.fittracker.pages.LogWorkoutPage;
import com.fittracker.pages.SessionPage;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class EditWorkoutTest extends BaseTest {

    @Test
    public void testEditWorkoutName() {
        System.out.println("[TEST] testEditWorkoutName started");
        signIn();

        LogWorkoutPage logPage = new LogWorkoutPage(driver, config.getWaitTimeout());
        logPage.navigate(config.getBaseUrl());
        System.out.println("[TEST] On /log page");

        logPage.enterSessionName("Push Session");
        logPage.selectExercise("Incline Dumbbell Press");
        logPage.enterSet("Incline Dumbbell Press", 0, "12", "40");
        logPage.clickSave();
        System.out.println("[TEST] Created workout, waiting for session page...");

        SessionPage sessionPage = new SessionPage(driver, config.getWaitTimeout());
        sessionPage.waitForLoad();
        Assert.assertTrue(sessionPage.getSessionTitle().contains("Push Session"),
                "Session title should contain original name");
        System.out.println("[TEST] Session created, title: " + sessionPage.getSessionTitle());

        sessionPage.clickEdit();
        System.out.println("[TEST] Clicked edit link, waiting for edit page...");

        By nameInput = By.cssSelector("[data-testid=\"session-name\"]");
        wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput)).clear();
        System.out.println("[TEST] Edit page loaded, cleared old name");
        driver.findElement(nameInput).sendKeys("Push Session (edited)");
        System.out.println("[TEST] Changed name to 'Push Session (edited)'");

        logPage.clickSave();
        System.out.println("[TEST] Saved changes, waiting for redirect...");

        sessionPage.waitForLoad();
        System.out.println("[TEST] Back on session page. Title: " + sessionPage.getSessionTitle());
        Assert.assertTrue(sessionPage.getSessionTitle().contains("Push Session (edited)"),
                "Session title should contain updated name after edit");
        System.out.println("[TEST] testEditWorkoutName PASSED");
    }
}
