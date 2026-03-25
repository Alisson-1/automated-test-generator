#!/bin/bash
set -euo pipefail

APP_NAME="exam-generator"
RESOURCE_GROUP="${APP_NAME}-rg"
LOCATION="${AZURE_LOCATION:-brazilsouth}"
ENV_NAME="${APP_NAME}-env"
BACKEND_APP="${APP_NAME}-backend"
FRONTEND_APP="${APP_NAME}-frontend"
TAG="${1:-$(date +%Y%m%d%H%M%S)}"

if [ -z "${DOCKERHUB_USER:-}" ]; then
  read -rp "DockerHub username: " DOCKERHUB_USER
fi

BACKEND_IMAGE="${DOCKERHUB_USER}/${APP_NAME}-backend:${TAG}"
FRONTEND_IMAGE="${DOCKERHUB_USER}/${APP_NAME}-frontend:${TAG}"

echo "──────────────────────────────────────────────────────────"
echo " Images  : $BACKEND_IMAGE"
echo "           $FRONTEND_IMAGE"
echo " Azure RG: $RESOURCE_GROUP ($LOCATION)"
echo "──────────────────────────────────────────────────────────"

echo ""
echo "[1/5] Building Docker images..."
docker build --target production -t "$BACKEND_IMAGE"  ./backend
docker build --target production -t "$FRONTEND_IMAGE" ./frontend

echo ""
echo "[2/5] Pushing images to DockerHub..."
docker push "$BACKEND_IMAGE"
docker push "$FRONTEND_IMAGE"

echo ""
echo "[3/5] Creating Azure resource group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo ""
echo "[4/5] Creating Container Apps environment (this may take a few minutes)..."
az containerapp env create \
  --name "$ENV_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

echo ""
echo "[5a/5] Deploying backend..."
az containerapp create \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENV_NAME" \
  --image "$BACKEND_IMAGE" \
  --target-port 3001 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars "PORT=3001" "NODE_ENV=production" \
  --output none

BACKEND_FQDN=$(az containerapp show \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo "    Backend URL: https://${BACKEND_FQDN}"

echo ""
echo "[5b/5] Deploying frontend..."
az containerapp create \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENV_NAME" \
  --image "$FRONTEND_IMAGE" \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 3 \
  --env-vars "BACKEND_URL=https://${BACKEND_FQDN}" \
  --output none

FRONTEND_URL=$(az containerapp show \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" \
  --output tsv)

echo ""
echo "══════════════════════════════════════════════════════════"
echo " Deploy complete!"
echo ""
echo "  Frontend : https://${FRONTEND_URL}"
echo "  Backend  : https://${BACKEND_FQDN}"
echo "══════════════════════════════════════════════════════════"
echo ""
echo "To update after code changes:"
echo "  DOCKERHUB_USER=$DOCKERHUB_USER ./deploy.sh $TAG"
echo ""
echo "To tear down all resources:"
echo "  az group delete --name $RESOURCE_GROUP --yes"
