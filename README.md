# SplitScale
A Split Tunneling Solution through Tailscale based on domain matching

## Prerequisites (covered in Instructions)
- A Tailscale Account
- Tailscale CLI configured on your system. The daemon controls Tailscale through the CLI interface, so this is necessary.
- A Chromium or Gecko based Browser. Safari isn't yet tested.
- A working brain 🧠, some courage, and patience to deal with this alpha project and read the documentation.
---

## Compatibility
- Windows
- macOS
- Linux (recommended as it's actively tested)
---

## Installation
[<img src="assets/github.png" alt="Get on GitHub" width="350px"/>](https://github.com/sannidhyaroy/SplitScale/releases/latest)
[<img src="assets/amo.svg" alt="Get the Addon" width="256px" style="padding: 20px;"/>](https://addons.mozilla.org/firefox/addon/splitscale)
---

## Quick Start
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sannidhyaroy/SplitScale.git
    ```
2.  **Navigate into the repository root folder**:
    ```bash
    cd SplitScale
    ```
3.  **Setup Python Virtual Environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  #for macOS and Linux
    venv\Scripts\activate     #for Windows
    ```
4.  **Install Flask**:
    ```bash
    pip install Flask
    ```
5.  **Run the daemon**:
    ```bash
    python daemon/daemon.py
    ```
6.  **Install the SplitScale extension**:
    Install from Store or load the `extension` directory as an unpacked extension.
7.  **Configure the extension**:
    Add some domains to exit-node mappings in the extension
8.  **Profit!!**
---

## Instructions

1.  **Install Tailscale**: 
    - Follow the instructions on [Tailscale's Download Page](https://tailscale.com/download) to install the Tailscale client or CLI. There is no official GUI for Linux, unlike on Windows and macOS. The Tailscale CLI is packaged inside the GUI Client on Windows and macOS, which might need additional configuration to access it. Refer to [Tailscale Docs](https://tailscale.com/kb/1080/cli) for more information. You need at least two devices (one as an exit-node, and the other as a client) where you want to route through the exit-node.

2.  **Verify Tailscale Installation**:
    - Test if Tailscale is working correctly by running `tailscale up`. If you aren't logged in, the CLI should provide a link to log in with your Tailscale account (or create one if you haven't already). You may or may not need a `sudo` prefix for the command.
    - If at least two devices are connected to Tailscale, you can run `tailscale status` and you should see the two devices listed along with their Tailscale IP and status.

3.  **Configure Exit Node**:
    - Prepare to configure one of the devices as an exit-node by running `tailscale up --advertise-exit-node`. Then allow the exit-node request of the device from the [admin console](https://login.tailscale.com/admin/machines) by clicking the `ellipsis icon menu` of the exit node device, then open the `Edit route` settings panel, and enable `Use as exit node`. Refer to [Advertise a device as an exit node](https://tailscale.com/kb/1103/exit-nodes#advertise-a-device-as-an-exit-node) and [Allow the exit node from the admin console](https://tailscale.com/kb/1103/exit-nodes#allow-the-exit-node-from-the-admin-console) for more info.

4.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sannidhyaroy/SplitScale.git
    ```
5.  **Install Flask**:
    - If Flask is not already installed, do so with:
      ```bash
      pip install Flask
      ```
6.  **(Optional): Use [Python Virtual Environments](https://docs.python.org/3/library/venv.html) for testing purposes**:
    - Ensure you're inside the repository folder, then create a Python Virtual Environment:
      ```bash
      python -m venv venv
      ```
    - Activate the Virtual Environment:
        - For Windows:
          ```
          venv\Scripts\activate
          ```
          - For macOS or Linux:
          ```bash
          source venv/bin/activate
          ```
    - Install Dependencies from `requirements.txt`:
      ```bash
      pip install -r requirements.txt
      ```
    - Verify Dependency Installation:
      ```bash
      pip list
      ```
    - After your work is done, you can deactivate the Virtual Environment:
      ```bash
      deactivate
      ```
7.  **Run the Flask Daemon**:
    - For testing purposes:
      - Temporarily, you can run the server using Flask's built-in development server:
        ```bash
        python <path_to_daemon.py>
        ```
    - For production purposes:
      1.  On Linux (with systemd):
          - Create a Systemd Service:
            ```bash
            sudo <editor_of_your_choice> /etc/systemd/system/splitscale.service
            ```
            You can use any editor, you're comfortable with, like `vim` or `nano`.
          - Paste the following contents in the `splitscale.service` file:
            ```
            [Unit]
            Description=SplitScale Daemon

            [Service]
            ExecStart=/usr/bin/python <absolute_path_to_daemon.py>
            WorkingDirectory=<working_dir>
            User=<username>
            Group=<groupname>

            [Install]
            WantedBy=multi-user.target
            ```
            Make sure to fill in the appropriate values, like your `username`, `groupname`, `working_dir`(Path to the SplitScale Directory), `absolute_path_to_daemon.py`(Absolute Path to the daemon executable).
          - Reload the systemd-daemon:
            ```bash
            sudo systemctl daemon-reload
            ```
          - Start the SplitScale daemon:
            ```bash
            sudo systemctl start splitscale
            ```
          - (Optional) If you want the SplitScale daemon to autostart when your system turns on, enable the SplitScale daemon:
            ```bash
            sudo systemctl enable splitscale
            ```
          - (Optional) For checking the SplitScale daemon logs:
            ```bash
            journalctl -u splitscale
            ```
          - (Optional) If you want to stop the daemon service for any reason:
            ```bash
            sudo systemctl stop splitscale
            ```
          - (Optional) If you want to disable autostart for the SplitScale Daemon:
            ```bash
            sudo systemctl disable splitscale
            ```
8.  **Install/Load the extension**:
    - For signed extension:
      1.  Firefox (or other Gecko-based browsers):
          - Easiest and recommended way to install SplitScale addon is from the [AMO (addons.mozilla.org)](https://addons.mozilla.org/firefox/addon/splitscale).
          - For manually installing a Firefox addon, download the `.crx` provided in the [Releases Page](https://github.com/sannidhyaroy/SplitScale/releases/latest) and navigate to `about:debugging > This Firefox > Load Temporary Add-on...` and select the `.crx` file.
      2.  Chrome (or other Chromium-based browsers):
          - Download the `.crx` file provided in the [Releases Page](https://github.com/sannidhyaroy/SplitScale/releases/latest).
          - Navigate to `chrome://extensions` (other Chromium-based browsers will redirect to the appropriate url) and drag and drop the `.crx` file into the browser. If should ask you to confirm installing the extension.
    - For unpacked extension:
      1.  Firefox:
          - Create a zip archive containing all the files in the `extension` directory.
          - Navigate to `about:debugging > This Firefox > Load Temporary Add-on...` and select the `.zip` file.
      2.  Chrome:
          - Open you browser (based on Chromium), navigate to `chrome://extensions` (other Chromium-based browsers will redirect to the appropriate url).
          - Turn on `Developer Mode` toggle and click `Load Unpacked`.
          - Choose the `extensions` directory inside this repository.
9.  **Configure the extension**:
    - Navigate to the `SplitScale` Extension Settings Page and map required domains to an exit-node IP. You can obtain the exit-node IP address of a device by running `tailscale status` and noting down the IP of the device advertising as exit node.
    - Test by visiting one of the configured domains. The extension should sent a request to the daemon process to use the configured device as an exit-node.
---

## Security & Privacy Considerations
- The SplitScale Daemon runs locally on port 5000, which is why for local control of Tailscale, Flask’s built-in server should be sufficient. Ensure your setup is secure and the port isn't exposed. Only run it on trusted networks and keep it accessible only from localhost to prevent unauthorized access. If users need a more robust local setup, use a production-ready WSGI server like Gunicorn (optional):
  - Install Gunicorn:
    ```bash
    pip install gunicorn
    ```
  - Run the daemon with gunicorn:
    ```bash
    gunicorn -w 4 -b 127.0.0.1:5000 <path_to_daemon.py>
    ```
- SplitScale is fully open-source, licensed under the [GNU Affero General Public License (AGPL) v3.0](https://github.com/sannidhyaroy/SplitScale/blob/main/LICENSE). We are in no way affiliated to or partnered with Tailscale.
- Tailscale is a partially open-source tool with some proprietary components, such as the Tailscale Coordination Server. Our project works with Tailscale’s existing setup and does not modify or distribute Tailscale’s proprietary software. Users must comply with Tailscale’s terms of service and licensing. For a fully open-source alternative to Tailscale’s coordination server, users might consider using [Headscale](https://github.com/juanfont/headscale). The instructions provided for this project assumes you're using the default Tailscale Coordination Server and their official client apps or cli, but it should work with Headscale as well. Read more at ["Open-Source at Tailscale"](https://tailscale.com/opensource).
---

## License
SplitScale is licensed under the [GNU Affero General Public License (AGPL) v3.0](https://github.com/sannidhyaroy/SplitScale/blob/main/LICENSE).