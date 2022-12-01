import bluetooth

CONTINUOUS_REPORTING = "04"
COMMAND_LIGHT = 11
COMMAND_REPORTING = 12
COMMAND_REGISTER = 16
COMMAND_READ_REGISTER = 17
INPUT_STATUS = 20
INPUT_READ_DATA = 21
EXTENSION_8BYTES = 32
BUTTON_DOWN_MASK = 8
TOP_RIGHT = 0
BOTTOM_RIGHT = 1
TOP_LEFT = 2
BOTTOM_LEFT = 3


address = None
buttonDown = False
buttonPressed = False
connected = False
controlSocket = None
recieveSocket = None


def send(controlSocket, data):
	data[0] = "52"

	sendData = bytearray.fromhex(data.join())
#	for byte in data:
#		byte = str(byte)
#		sendData += byte.decode("hex")

	controlSocket.send(sendData)


def setLight(controlSocket, light):
	if light:
		val = "10"
	else:
		val = "00"

	message = ["00", COMMAND_LIGHT, val]
	send(controlSocket, message)


recieveSocket = bluetooth.BluetoothSocket(bluetooth.L2CAP)
controlSocket = bluetooth.BluetoothSocket(bluetooth.L2CAP)


while True:
	if not connected:
		bluetoothdevices = bluetooth.discover_devices(
			duration=2,
			lookup_names=True,
		)
		
		print('devices', bluetoothdevices)
		
		for device in bluetoothdevices:
			print('device', device)
			
			if device[1] == "Nintendo RVL-WBC-01":
				address = device[0]
				print('wibb addr', address)
				
				recieveSocket.connect((address, 0x13))
				controlSocket.connect((address, 0x11))
				
				if recieveSocket and controlSocket:
					message = ["00", COMMAND_READ_REGISTER, "04", "A4", "00", "24", "00", "18"]
					send(controlSocket, message)
					
					useExt = ["00", COMMAND_REGISTER, "04", "A4", "00", "40", "00"]
					send(controlSocket, useExt)

					bytearr = ["00", COMMAND_REPORTING, CONTINUOUS_REPORTING, EXTENSION_8BYTES]
					send(controlSocket, bytearr)
					
					setLight(controlSocket, True)

					connected = True
	else:
		print('connected')
		data = recieveSocket.recv(25)
		print('data', data)
		
		try:
			intype = hex(int(data[2:4]))
		except:
			print('decode error', data)
			continue
		
		print('intype', intype)
		
		if intype == INPUT_STATUS:
			# set Reporting Type
			bytearr = ["00", COMMAND_REPORTING, CONTINUOUS_REPORTING, EXTENSION_8BYTES]
			send(controlSocket, bytearr)
		elif intype == INPUT_READ_DATA:
			if calibrationRequested:
				packetLength = (
					hex(int(data[4]).encode("hex"), 16) / 16 + 1)
				calibration = parseCalibrationResponse(
					calibration, data[7:(7 + packetLength)])

				if packetLength < 16:
					calibrationRequested = False
		elif intype == EXTENSION_8BYTES:
			bytes = data[2:12]
			buttonBytes = bytes[0:2]
			bytes = bytes[2:12]
			buttonPressed = False
			buttonReleased = False
			
			state = (int(buttonBytes[0].encode("hex"), 16) << 8) | int(
				buttonBytes[1].encode("hex"), 16
			)
			
			if state == BUTTON_DOWN_MASK:
				buttonPressed = True
				if not buttonDown:
					# button pressed
					buttonDown = True
			
			if not buttonPressed:
				if buttonDown:
					# button released
					buttonReleased = True
					buttonDown = False
			
			rawTR = (int(bytes[0].encode("hex"), 16) << 8) + int(bytes[1].encode("hex"), 16)
			rawBR = (int(bytes[2].encode("hex"), 16) << 8) + int(bytes[3].encode("hex"), 16)
			rawTL = (int(bytes[4].encode("hex"), 16) << 8) + int(bytes[5].encode("hex"), 16)
			rawBL = (int(bytes[6].encode("hex"), 16) << 8) + int(bytes[7].encode("hex"), 16)

			topLeft = calcMass(calibration, rawTL, TOP_LEFT)
			topRight = calcMass(calibration, rawTR, TOP_RIGHT)
			bottomLeft = calcMass(calibration, rawBL, BOTTOM_LEFT)
			bottomRight = calcMass(calibration, rawBR, BOTTOM_RIGHT)

			totalWeight = topLeft + topRight + bottomLeft + bottomRight

			print('{ "connected": true, "topLeft":' + str(topLeft) + ', "topRight":' + str(topRight) + ', "bottomLeft":' + str(bottomLeft) + ', "bottomRight":' + str(bottomRight) + ', "totalWeight":' + str(totalWeight) + ', "buttonPressed":' + str(buttonPressed).lower() + ', "buttonReleased":' + str(buttonReleased).lower() + '}')
			
			sys.stdout.flush()
