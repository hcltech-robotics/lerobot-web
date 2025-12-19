# Troubleshooting

This document describes common issues that may occur during setup and operation of the application and the LeRobot SO100 and SO101 robot arms, along with recommended solutions.

---

## Common Issues During Initial Setup

### USB Bandwidth and Hardware Connections

When starting the app, ensure that robot arms and cameras are **not connected to the same USB hub** if possible.

If multiple high-bandwidth devices (robot arms and cameras) share a single USB hub:
- USB bandwidth may become saturated
- Camera streams may not appear or may be low quality
- Robot motion may become jerky
- Servo motor state feedback may arrive late or not at all
- Robot control may return errors

**Recommendation:**  
Connect cameras and robot arms to different USB ports or hubs on the computer whenever possible.

---

### USB Cable Quality

Poor-quality or excessively long USB cables can cause intermittent communication issues between the computer and the robot arms.

**Symptoms may include:**
- Random disconnections
- Missing servo feedback
- Unstable or delayed movement
- Robot arm becoming unresponsive

**Recommendation:**  
Use short, high-quality, shielded USB cables and connect them directly to the motherboard USB ports whenever possible.

---

## Camera Issues

### Cameras Do Not Work or Are Missing

- Check how many cameras are connected to a single USB port or hub.
- Refreshing the browser reloads camera streams that were already connected at application startup.
- If a camera is unplugged or a new camera is connected while the application is running, the camera list will **not update automatically**.

**Solution:**  
Restart the application to refresh the camera list.

---

## Robot Arm Does Not Move

The following issues may cause the robot arm to stop moving.

### Power and Connection Issues

- The robot arm is not connected to the computer or to a power source.
- A cable may have come loose from the rear panel of the robot arm.
  - This can happen easily as the screws holding the cables may loosen over time.
  - Periodically check and tighten connections.

---

### Power Supply Instability

If the power supply does not meet the required specifications of the SO100 robot arm, servo motors may experience undervoltage.

**Symptoms may include:**
- Sudden loss of torque
- Temporary shutdown of one or more joints
- Unstable or inconsistent movement

**Recommendation:**  
Ensure that the power supply matches the SO100 or SO101 specifications and can deliver sufficient current under load.

---

### Servo Motor Blocking

- One or more servo motors may have become blocked during a previous run or error state.
- A typical sign is that the robot arm **cannot be moved manually**.

**How to check:**
- Try to gently move the arm without applying force.
- If it does not move at all, the servos are likely blocked.

**Solution:**
1. Power off the robot arm.
2. Wait a short time.
3. Power it back on.
4. The arm should move freely again.

---

### Missing Calibration File

If the calibration file is missing, the robot arm will not operate correctly.

**Solution:**
- Run the calibration process from the calibration menu and follow the steps carefully  
  **or**
- Run calibration manually from the terminal.

Make sure the IDs are set correctly. For a single armpair, IDs must end with "left" and use the following values:

    robot_id = hcltech_lerobot_follower_arm_left
    teleop_id = hcltech_lerobot_leader_arm_left

---

## Leader Arm Vibrates and Follower Arm Does Not Move

If the leader (teleoperation) arm makes a buzzing or vibrating sound when teleoperation starts and the follower arm does not move:

**Cause:**  
Leader and follower arms are incorrectly assigned in the UI.

**Solution:**
1. Click the robot icons in the **top-right corner of the UI**.
2. In the dropdown menu, correctly assign:
   - L = Leader arm
   - F = Follower arm

---

## Identifying Robot Arms Without udev Rules

If robot arm IDs are visible in the settings UI and no udev rules are configured, it may be unclear which ID belongs to which physical arm.

**Easy identification method:**
1. Unplug one robot arm's USB cable.
2. Refresh the page.
3. Only the connected arm will appear in the settings.
4. Reconnect the unplugged arm and refresh again.

Both arms will now be visible and selectable.

---

## Follower Arm Does Not Accurately Follow the Leader Arm

**Likely cause:** Calibration error.

**Solution:**  
Re-run the calibration process and follow the instructions precisely.

---

## Arm Drops Briefly During Teleoperation

If the robot arm suddenly drops or loses torque for a short time during teleoperation and then resumes movement:

**Likely cause:** Servo motor failure.

- This often happens at a specific joint or during certain movements.
- Possible causes:
  - Mechanical damage inside the servo
  - Burned or partially damaged motor

**Explanation:**  
The affected servo requires more force than normal, which triggers overload protection and temporarily disables the motor.

---

## Robot Arm Stops Completely and Does Not Recover

If the robot arm stops and remains unresponsive even after restarting the application:

**Most common causes:**
- Mechanical failure of the robot arm
- Servo motor failure
- Loose cables between servos on main panel
- USB port overload causing delayed or missing servo feedback

**Recommended actions:**
- Check all physical connections
- Gently move the robot arm by hand
- Verify that all joints can move freely
- Restart the application

---

## Recording Issues

### Start Button Is Disabled Despite Filled Recording Form

**Likely cause:**  
Hugging Face user ID and access token are not set and saved on the configuration page.

**Solution:**  
Set and save the Hugging Face user ID and token, then retry.

---

### Recording Fails Immediately After Starting

- The error message usually explains the issue.
- Check the terminal for additional logs.

**Most common cause:**  
A dataset with the same name already exists locally.

**Solution:**
1. Navigate to:

       ./cache/huggingface/lerobot/{{HUGGINGFACE_USER_ID}}

2. Use unique dataset name or remove unused or conflicting datasets.
3. Retry recording.

---

## Inference Issues

During inference, the same errors may occur as during recording.

**Recommendation:**  
Follow the troubleshooting steps described in the **Recording Issues** section above.
