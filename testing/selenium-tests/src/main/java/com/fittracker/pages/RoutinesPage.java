package com.fittracker.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class RoutinesPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By newRoutineBtn = By.cssSelector("[data-testid=\"new-routine-btn\"]");
    private final By routineCards = By.cssSelector("[data-testid=\"routine-card\"]");

    // New routine form
    private final By routineNameInput = By.cssSelector("[data-testid=\"routine-name-input\"]");
    private final By splitSelect = By.cssSelector("[data-testid=\"routine-split-select\"]");
    private final By splitItems = By.cssSelector("[data-testid=\"routine-split-item\"]");
    private final By saveRoutineBtn = By.cssSelector("[data-testid=\"save-routine-btn\"]");

    public RoutinesPage(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    public void navigate(String baseUrl) {
        driver.get(baseUrl + "/routines");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("[data-testid=\"routines-header\"]")));
    }

    public int getRoutineCardCount() {
        return driver.findElements(routineCards).size();
    }

    public void clickNewRoutine() {
        wait.until(ExpectedConditions.elementToBeClickable(newRoutineBtn)).click();
    }

    public boolean isRoutineVisible(String name) {
        By locator = By.cssSelector("[data-testid=\"routine-card\"][data-routine=\"" + name + "\"]");
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).isDisplayed();
    }

    // New routine form methods
    public void enterRoutineName(String name) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(routineNameInput)).sendKeys(name);
    }

    public void selectSplit(String splitLabel) {
        // Click the trigger using JS to avoid overlay interception
        WebElement trigger = wait.until(ExpectedConditions.presenceOfElementLocated(splitSelect));
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", trigger);
        // Wait for the popup list to appear
        wait.until(ExpectedConditions.visibilityOfElementLocated(splitItems));
        // Find and click the target item using JS
        driver.findElements(splitItems).stream()
                .filter(el -> el.getText().equals(splitLabel))
                .findFirst()
                .ifPresent(el -> ((JavascriptExecutor) driver).executeScript("arguments[0].click();", el));
        // Press Escape to ensure any lingering popup closes, then wait
        try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        driver.findElement(By.cssSelector("body")).sendKeys(org.openqa.selenium.Keys.ESCAPE);
        try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    public void toggleExercise(String exerciseName) {
        By locator = By.cssSelector("[data-testid=\"routine-exercise-toggle\"][data-exercise=\"" + exerciseName + "\"]");
        // Wait for the exercise button to be present in DOM
        wait.until(ExpectedConditions.presenceOfElementLocated(locator));
        // Scroll into view, then JS-click to bypass any lingering overlay
        WebElement el = driver.findElement(locator);
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        try { Thread.sleep(200); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        ((JavascriptExecutor) driver).executeScript("arguments[0].click();", el);
    }

    public void clickSave() {
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(saveRoutineBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        el.click();
    }
}
