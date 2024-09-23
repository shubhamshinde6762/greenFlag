from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
import random
import string
import time

chrome_options = Options()
chrome_options.add_argument("--ignore-certificate-errors")

capabilities = DesiredCapabilities.CHROME.copy()
capabilities['acceptInsecureCerts'] = True

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Inject a visual cursor into the page
def inject_visual_cursor(driver):
    cursor_js = """
    var cursor = document.createElement('div');
    cursor.id = 'selenium-cursor';
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'red';
    cursor.style.position = 'absolute';
    cursor.style.zIndex = '9999';
    cursor.style.pointerEvents = 'none';
    document.body.appendChild(cursor);

    window.moveCursor = function(x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    };
    """
    driver.execute_script(cursor_js)

def move_visual_cursor(driver, x, y):
    move_js = f"window.moveCursor({x}, {y});"
    driver.execute_script(move_js)

def scroll_to_element(driver, element):
    """Scroll the element into view using JavaScript."""
    driver.execute_script("arguments[0].scrollIntoView();", element)

def simulate_smooth_mouse_movements(driver, target_element):
    """Simulate smooth mouse movements to the target element."""
    actions = ActionChains(driver)
    scroll_to_element(driver, target_element)  
    
    location = target_element.location
    move_visual_cursor(driver, location['x'], location['y'])
    
    actions.move_to_element(target_element).perform()
    time.sleep(0.05)

def login(username, otp=None):
    try:
        driver.get("http://localhost:3000/login")
        
        inject_visual_cursor(driver)
    
        aadhar_input = driver.find_element(By.NAME, "aadharNumber")
        simulate_smooth_mouse_movements(driver, aadhar_input)
        aadhar_input.send_keys(username)

        # Locate and click the submit button
        submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        simulate_smooth_mouse_movements(driver, submit_button)
        submit_button.click()

        # If OTP is required, handle OTP input
        if otp:
            otp_input = driver.find_element(By.NAME, "otp")
            simulate_smooth_mouse_movements(driver, otp_input)
            otp_input.send_keys(otp)

            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            simulate_smooth_mouse_movements(driver, submit_button)
            submit_button.click()

        print("Page title after login:", driver.title)
        print("Current URL:", driver.current_url)

    except Exception as e:
        print(f"An error occurred during the login process: {str(e)}")

def main():
    try:
        for attempt in range(5):
            username = ''.join(random.choices(string.digits, k=12))
            password = ''.join(random.choices(string.digits, k=6))
            print(f"Attempt {attempt + 1} of 5 using credentials: {username} and {password}")
            login(username, password)
            time.sleep(4)

    finally:
        driver.quit()

main()
