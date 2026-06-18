package com.fittracker.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CalendarPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By calendarHeader = By.cssSelector("[data-testid=\"calendar-header\"]");
    private final By monthTitle = By.cssSelector("[data-testid=\"month-title\"]");
    private final By calendarGrid = By.cssSelector("[data-testid=\"calendar-grid\"]");
    private final By weekSummary = By.cssSelector("[data-testid=\"week-summary\"]");
    private final By weekWorkoutCount = By.cssSelector("[data-testid=\"week-workout-count\"]");
    private final By logWorkoutBtn = By.cssSelector("[data-testid=\"log-workout-btn\"]");
    private final By monthPrev = By.cssSelector("[data-testid=\"month-prev\"]");
    private final By monthNext = By.cssSelector("[data-testid=\"month-next\"]");

    public CalendarPage(WebDriver driver, int timeoutSeconds) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
    }

    public void navigate(String baseUrl) {
        driver.get(baseUrl + "/");
        wait.until(ExpectedConditions.visibilityOfElementLocated(calendarHeader));
    }

    public boolean isMonthTitleVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(monthTitle)).isDisplayed();
    }

    public boolean isCalendarGridVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(calendarGrid)).isDisplayed();
    }

    public boolean isWeekSummaryVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(weekSummary)).isDisplayed();
    }

    public boolean isLogWorkoutBtnVisible() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(logWorkoutBtn)).isDisplayed();
    }

    public String getMonthTitle() {
        return driver.findElement(monthTitle).getText();
    }

    public void clickPrevMonth() {
        driver.findElement(monthPrev).click();
    }

    public void clickNextMonth() {
        driver.findElement(monthNext).click();
    }

    public void clickLogWorkout() {
        driver.findElement(logWorkoutBtn).click();
    }
}
