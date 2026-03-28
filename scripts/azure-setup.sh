#!/bin/bash
# =====================================================================
# Av/IntelOS — Azure App Service Setup Script
# Creates the Web App on the SHARED avsocialos-plan (B1)
# Run: bash scripts/azure-setup.sh
# Requires: Azure CLI (az) authenticated
# =====================================================================

set -e

# Configuration
APP_NAME="avintelos"
RESOURCE_GROUP="rg-globalair-avos"
LOCATION="centralus"
SHARED_PLAN="avsocialos-plan"  # Shared B1 plan — $0 incremental
NODE_VERSION="20-lts"

echo ""
echo "  Av/IntelOS — Azure Deployment"
echo "  ─────────────────────────────────"
echo "  App:      $APP_NAME"
echo "  RG:       $RESOURCE_GROUP"
echo "  Region:   $LOCATION"
echo "  Plan:     $SHARED_PLAN (shared B1 — \$0 incremental)"
echo "  Node:     $NODE_VERSION"
echo "  ─────────────────────────────────"
echo ""

# Step 1: Login check
echo "[1/5] Checking Azure login..."
az account show > /dev/null 2>&1 || {
  echo "  Not logged in. Running: az login"
  az login
}
echo "  ✓ Logged in as: $(az account show --query user.name -o tsv)"

# Step 2: Verify resource group exists (shared with SocialOS)
echo "[2/5] Verifying resource group..."
az group show --name "$RESOURCE_GROUP" > /dev/null 2>&1 && echo "  ✓ Resource group: $RESOURCE_GROUP" || {
  echo "  Creating resource group..."
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none
  echo "  ✓ Resource group created: $RESOURCE_GROUP"
}

# Step 3: Verify shared App Service Plan exists
echo "[3/5] Verifying shared App Service Plan..."
az appservice plan show --name "$SHARED_PLAN" --resource-group "$RESOURCE_GROUP" > /dev/null 2>&1 && echo "  ✓ Plan exists: $SHARED_PLAN" || {
  echo "  ERROR: Shared plan '$SHARED_PLAN' not found in '$RESOURCE_GROUP'."
  echo "  Run the SocialOS azure-setup.sh first, or create the plan manually:"
  echo "  az appservice plan create --name $SHARED_PLAN --resource-group $RESOURCE_GROUP --sku B1 --is-linux"
  exit 1
}

# Step 4: Create Web App on shared plan
echo "[4/5] Creating Web App..."
az webapp create \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$SHARED_PLAN" \
  --runtime "NODE|$NODE_VERSION" \
  --output none 2>/dev/null && echo "  ✓ Web App: $APP_NAME" || echo "  ✓ Web App exists"

# Step 5: Configure settings
echo "[5/5] Configuring app settings..."
az webapp config appsettings set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    WEBSITE_NODE_DEFAULT_VERSION="~20" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
  --output none
echo "  ✓ App settings configured"

# Set startup command
az webapp config set \
  --name "$APP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --startup-file "node server.js" \
  --output none
echo "  ✓ Startup command: node server.js"

# Output connection instructions
echo ""
echo "  ─────────────────────────────────"
echo "  NEXT STEPS:"
echo ""
echo "  1. Get the publish profile:"
echo "     az webapp deployment list-publishing-profiles \\"
echo "       --name $APP_NAME --resource-group $RESOURCE_GROUP --xml"
echo ""
echo "  2. Add as GitHub secret: AZURE_WEBAPP_PUBLISH_PROFILE"
echo "     https://github.com/globalairmarketingops-commits/avintel-os/settings/secrets/actions"
echo ""
echo "  3. Push to master — GitHub Actions will auto-deploy"
echo "  ─────────────────────────────────"

# Output URL
APP_URL="https://${APP_NAME}.azurewebsites.net"
echo ""
echo "  App URL:  $APP_URL"
echo "  Health:   $APP_URL/api/health"
echo "  API:      $APP_URL/api/data"
echo "  ─────────────────────────────────"
echo ""
echo "  Done. App will be live after first deployment."
echo ""
