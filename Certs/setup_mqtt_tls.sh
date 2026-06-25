#!/bin/bash

# ====================================================
# MQTT TLS Setup Script - Fresh Setup for Mosquitto
# ====================================================

# Change this path if you want certs elsewhere
CERT_DIR="$HOME/mosquitto_certs"
MOSQ_CONF="$CERT_DIR/mosquitto.conf"

echo "==> Cleaning old certificates..."
rm -rf "$CERT_DIR"
mkdir -p "$CERT_DIR"
cd "$CERT_DIR" || exit

echo "==> Generating CA key and certificate..."
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days 3650 -out ca.crt \
  -subj "/C=IN/ST=Karnataka/L=Badanahatti/O=MyOrg/OU=MQTT/CN=MyMQTT-CA"

echo "==> Generating Server key and CSR..."
openssl genrsa -out server.key 4096
openssl req -new -key server.key -out server.csr \
  -subj "/C=IN/ST=Karnataka/L=Badanahatti/O=MyOrg/OU=MQTT/CN=localhost"

echo "==> Signing Server certificate with CA..."
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days 365 -sha256

echo "==> Generating Client key and CSR..."
openssl genrsa -out client.key 4096
openssl req -new -key client.key -out client.csr \
  -subj "/C=IN/ST=Karnataka/L=Badanahatti/O=MyOrg/OU=MQTT/CN=MQTTClient"

echo "==> Signing Client certificate with CA..."
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out client.crt -days 365 -sha256

echo "==> Creating Mosquitto configuration..."
cat > "$MOSQ_CONF" <<EOL
# Mosquitto TLS listener
listener 8883
cafile $CERT_DIR/ca.crt
certfile $CERT_DIR/server.crt
keyfile $CERT_DIR/server.key
require_certificate false
tls_version tlsv1.2

# Logging
log_type all
EOL

echo "==> Setup Complete!"
echo "Certificates and config are in: $CERT_DIR"
echo "Mosquitto config file: $MOSQ_CONF"

echo ""
echo "To start Mosquitto with TLS:"
echo "  mosquitto -c $MOSQ_CONF -v"
echo ""
echo "To test with a subscriber:"
echo "  mosquitto_sub -h localhost -p 8883 -t test/topic --cafile $CERT_DIR/ca.crt -d"
echo ""
echo "To test with a publisher:"
echo "  mosquitto_pub -h localhost -p 8883 -t test/topic -m 'Hello MQTT' --cafile $CERT_DIR/ca.crt -d"
echo ""
echo "Optional: Use client certificate:"
echo "  mosquitto_sub -h localhost -p 8883 -t test/topic --cafile $CERT_DIR/ca.crt --cert $CERT_DIR/client.crt --key $CERT_DIR/client.key -d"

