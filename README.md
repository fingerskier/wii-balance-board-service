# wii-balance-board-service
Wii balance-board service

Derived from [wii-balance-board-pi](https://www.npmjs.com/package/wii-balance-board-pi)


## Prerequisites

Mayhaps needs:

```
sudo apt-get --assume-yes install bluez python-bluez python-gobject python-dbus
```


## Usage

Pair the balance board in the OS.

Running this node app provides a web-server with a web-socket the spits out balance board data.

Look at `\public\test.html` for an example.