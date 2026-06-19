package com.fittracker.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class SessionPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By sessionTitle = By.cssSelector("[data-testid=\"session-title\"]");
    private final By editSessionLink = By.cssSelector("[data-testid=\"edit-session-link\"]");
    private final By bodypartBadges = By.cssSelector("[data-testid=\"session-bodypart-badge\"]");
    private final By backToCalendar = By.cssSelector("[data-testid=\"back-to-calendar\"]");

    public SessionPage(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    public void waitForLoad() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(sessionTitle));
    }

    public String getSessionTitle() {
        return driver.findElement(sessionTitle).getText();
    }

    public boolean isExerciseCardVisible(String exerciseName) {
        By locator = By.cssSelector("[data-testid=\"exercise-card\"][data-exercise=\"" + exerciseName + "\"]");
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).isDisplayed();
    }

    public int getBodypartBadgeCount() {
        return driver.findElements(bodypartBadges).size();
    }

    public void clickEdit() {
        wait.until(ExpectedConditions.elementToBeClickable(editSessionLink)).click();
    }

    public boolean isCurrentUrlSessionPage() {
        return driver.getCurrentUrl().matches(".*/session/\\d+$");
    }
}
