package com.fittracker.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class LogWorkoutPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By sessionNameInput = By.cssSelector("[data-testid=\"session-name\"]");
    private final By addSetBtn = By.cssSelector("[data-testid=\"add-set\"]");
    private final By saveWorkoutBtn = By.cssSelector("[data-testid=\"save-workout\"]");

    public LogWorkoutPage(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    public void navigate(String baseUrl) {
        driver.get(baseUrl + "/log");
        wait.until(ExpectedConditions.visibilityOfElementLocated(sessionNameInput));
    }

    public void enterSessionName(String name) {
        driver.findElement(sessionNameInput).sendKeys(name);
    }

    public void selectBodyPart(String bodyPartName) {
        By locator = By.cssSelector("[data-testid=\"bodypart-toggle\"][data-bodypart=\"" + bodyPartName + "\"]");
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(locator));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        el.click();
    }

    public void selectExercise(String exerciseName) {
        By locator = By.cssSelector("[data-testid=\"exercise-toggle\"][data-exercise=\"" + exerciseName + "\"]");
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(locator));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        el.click();
    }

    public void enterSet(String exerciseName, int setIndex, String reps, String weight) {
        By repsLocator = By.cssSelector("[data-testid=\"set-reps\"][data-exercise=\"" + exerciseName + "\"][data-set-index=\"" + setIndex + "\"]");
        By weightLocator = By.cssSelector("[data-testid=\"set-weight\"][data-exercise=\"" + exerciseName + "\"][data-set-index=\"" + setIndex + "\"]");

        wait.until(ExpectedConditions.visibilityOfElementLocated(repsLocator)).sendKeys(reps);
        driver.findElement(weightLocator).sendKeys(weight);
    }

    public void clickAddSet() {
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(addSetBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        el.click();
    }

    public void clickSave() {
        WebElement el = wait.until(ExpectedConditions.elementToBeClickable(saveWorkoutBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", el);
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        el.click();
    }
}
