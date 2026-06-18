package com.fittracker.tests;

import com.fittracker.BaseTest;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AddBodyPartAndExerciseTest extends BaseTest {

    @Test
    public void testAddBodyPartAndExercise() {
        System.out.println("[TEST] testAddBodyPartAndExercise started");
        signIn();

        driver.get(config.getBaseUrl() + "/log");
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("h1")));
        System.out.println("[TEST] On /log page");

        org.openqa.selenium.WebElement addBpBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid=\"add-bodypart-btn\"]")));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", addBpBtn);
        addBpBtn.click();
        System.out.println("[TEST] Opening Add Body Part dialog");

        By nameInput = By.cssSelector("[data-testid=\"bodypart-name-input\"]");
        wait.until(ExpectedConditions.visibilityOfElementLocated(nameInput))
                .sendKeys("Forearms");
        driver.findElement(By.cssSelector("[data-testid=\"bodypart-add-confirm\"]")).click();
        System.out.println("[TEST] Submitted body part 'Forearms'");

        // Wait for dialog to fully close before clicking the toggle
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        By forearmsToggle = By.cssSelector("[data-testid=\"bodypart-toggle\"][data-bodypart=\"Forearms\"]");
        org.openqa.selenium.WebElement forearmsEl = wait.until(
                ExpectedConditions.elementToBeClickable(forearmsToggle));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", forearmsEl);
        forearmsEl.click();
        System.out.println("[TEST] Activated Forearms body part");

        org.openqa.selenium.WebElement addExBtn = wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("[data-testid=\"add-exercise-btn\"]")));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", addExBtn);
        addExBtn.click();
        System.out.println("[TEST] Opening Add Exercise dialog");

        By exNameInput = By.cssSelector("[data-testid=\"exercise-name-input\"]");
        wait.until(ExpectedConditions.visibilityOfElementLocated(exNameInput))
                .sendKeys("Wrist Curl");
        driver.findElement(By.cssSelector("[data-testid=\"exercise-add-confirm\"]")).click();
        System.out.println("[TEST] Submitted exercise 'Wrist Curl'");

        // Wait for dialog to fully close
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        By wristCurlToggle = By.cssSelector("[data-testid=\"exercise-toggle\"][data-exercise=\"Wrist Curl\"]");
        org.openqa.selenium.WebElement wristEl = wait.until(
                ExpectedConditions.visibilityOfElementLocated(wristCurlToggle));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript(
                "arguments[0].scrollIntoView({block: 'center'});", wristEl);
        Assert.assertTrue(wristEl.isDisplayed(),
                "Wrist Curl exercise toggle should be visible after creation");
        System.out.println("[TEST] testAddBodyPartAndExercise PASSED");
    }
}
