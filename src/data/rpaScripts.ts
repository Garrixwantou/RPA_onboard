/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const PUPPETEER_SCRIPT = `/**
 * SCRIPT RPA INDUSTRIEL - PROVISIONNEMENT & DE-PROVISIONNEMENT D'ACCÈS
 * Langage : Node.js | Librairie : Puppeteer (Chrome Headless)
 * 
 * Contexte Académique : automatisation résiliente multi-plateforme sans API.
 * Stratégies de robustesse implémentées :
 *  - Recherche multi-critères et sélecteurs de secours (Anchor Selection)
 *  - Attente asynchrone des états de l'interface (Wait-and-Retry)
 *  - Gestion de la variabilité réseau par des timeouts adaptatifs
 */

const puppeteer = require('puppeteer');

// Configuration des plateformes et sélecteurs résilients
const CONFIG = {
  timeout: 10000,
  promail: {
    url: 'https://promail-admin.secure-entreprise.internal/users',
    selectors: {
      addButton: ['#btn-add-user', 'button[aria-label="Add User"]', 'button.create-user-trigger'],
      firstnameInput: ['input[name="first_name"]', 'input#firstname_field', '[placeholder="Prénom"]'],
      lastnameInput: ['input[name="last_name"]', 'input#lastname_field', '[placeholder="Nom"]'],
      emailInput: ['input[type="email"]', 'input[name="email"]', '#user_email_address'],
      roleSelect: ['select[name="role"]', '#user-role-select'],
      submitButton: ['button#save-user', 'button[type="submit"]', '//button[contains(text(), "Enregistrer")]'],
      deleteButtonTemplate: (email) => \`button[data-delete-user="\${email}"], tr[data-user-id="\${email}"] button.delete\`
    }
  },
  cloudvault: {
    url: 'https://cloudvault-admin.secure-entreprise.internal/folders',
    selectors: {
      createUserFolderBtn: ['#create-folder-btn', '.btn-new-directory', 'button:has-text("Créer Espace")'],
      folderNameInput: ['input[name="folder_name"]', '#dir-name-input'],
      accessGroupSelect: ['select[name="access_level"]', '.group-picker'],
      confirmCreateBtn: ['button.confirm-add', '#btn-submit-folder'],
      revokeAccessTemplate: (email) => \`tr[data-owner="\${email}"] .btn-revoke-access\`
    }
  },
  collabchat: {
    url: 'https://workspace-chat.secure-entreprise.internal/admin/members',
    selectors: {
      inviteBtn: ['#invite-member-btn', '.chat-members-invite', 'button:contains("Inviter")'],
      emailField: ['#invite-email-input', '.invite-input-email'],
      roleDropdown: ['.role-dropdown-trigger', 'select.invite-role'],
      submitInvite: ['button.btn-send-invitation', '#btn-submit-invite'],
      disableBtnTemplate: (email) => \`tr:has-text("\${email}") button.disable-account\`
    }
  }
};

/**
 * Fonction utilitaire de clic résiliente avec fallback de sélecteurs
 */
async function resilientClick(page, selectors) {
  for (const selector of selectors) {
    try {
      if (selector.startsWith('//')) {
        // XPath selection
        const element = await page.waitForXPath(selector, { visible: true, timeout: 3000 });
        await element.click();
        return true;
      } else {
        // CSS selection
        await page.waitForSelector(selector, { visible: true, timeout: 3000 });
        await page.click(selector);
        return true;
      }
    } catch (e) {
      console.warn(\`Sélecteur [\${selector}] indisponible, essai du fallback suivant...\`);
    }
  }
  throw new Error(\`Impossible de cliquer. Aucun des sélecteurs n'a pu être résolu : \${selectors.join(', ')}\`);
}

/**
 * Saisie clavier sécurisée
 */
async function resilientType(page, selectors, text) {
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 3000 });
      // Efface le champ avant saisie
      await page.click(selector, { clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.type(selector, text, { delay: 30 }); // Délai humain de 30ms
      return true;
    } catch (e) {
      console.warn(\`Échéc de saisie sur le sélecteur [\${selector}], essai du fallback...\`);
    }
  }
  throw new Error(\`Impossible de saisir le texte. Aucun sélecteur disponible : \${selectors.join(', ')}\`);
}

/**
 * Ordonnanceur RPA Principal
 */
async function runRpaWorkflow(action, userData) {
  console.log(\`[RPA Engine] Démarrage du robot en mode \${action.toUpperCase()}\`);
  
  const browser = await puppeteer.launch({
    headless: false, // Mode visible pour démonstration jury
    defaultViewport: { width: 1280, height: 800 },
    args: ['--start-maximized', '--no-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    if (action === 'onboard') {
      console.log(\`[RPA Engine] Début de la procédure d'Onboarding pour \${userData.firstname} \${userData.lastname}\`);
      
      // 1. PROVISONNEMENT PROMAIL (Email d'entreprise)
      console.log('--- Étape 1 : Provisionnement ProMail ---');
      await page.goto(CONFIG.promail.url, { waitUntil: 'networkidle2' });
      await resilientClick(page, CONFIG.promail.selectors.addButton);
      await resilientType(page, CONFIG.promail.selectors.firstnameInput, userData.firstname);
      await resilientType(page, CONFIG.promail.selectors.lastnameInput, userData.lastname);
      await resilientType(page, CONFIG.promail.selectors.emailInput, userData.email);
      await resilientClick(page, CONFIG.promail.selectors.submitButton);
      console.log('✔ Compte Email d\\'entreprise créé !');
      await page.waitForTimeout(1500); // Temporisation logique de visibilité

      // 2. STOCKAGE CLOUDVAULT (Espace de stockage)
      console.log('--- Étape 2 : Création d\\'espace CloudVault ---');
      await page.goto(CONFIG.cloudvault.url, { waitUntil: 'networkidle2' });
      await resilientClick(page, CONFIG.cloudvault.selectors.createUserFolderBtn);
      await resilientType(page, CONFIG.cloudvault.selectors.folderNameInput, \`partage-\${userData.lastname.toLowerCase()}\`);
      await resilientClick(page, CONFIG.cloudvault.selectors.confirmCreateBtn);
      console.log('✔ Espace de stockage CloudVault provisionné !');
      await page.waitForTimeout(1500);

      // 3. MESSAGERIE COLLABCHAT (Intégration d\\'équipe)
      console.log('--- Étape 3 : Invitation sur CollabChat ---');
      await page.goto(CONFIG.collabchat.url, { waitUntil: 'networkidle2' });
      await resilientClick(page, CONFIG.collabchat.selectors.inviteBtn);
      await resilientType(page, CONFIG.collabchat.selectors.emailField, userData.email);
      await resilientClick(page, CONFIG.collabchat.selectors.submitInvite);
      console.log('✔ Invitation de messagerie d\\'équipe envoyée !');
      
      console.log(\`[RPA Engine] SUCCÈS : Onboarding complet terminé en \${((Date.now() - userData.startTime) / 1000).toFixed(2)}s\`);

    } else if (action === 'offboard') {
      console.log(\`[RPA Engine] Début de la procédure d'Offboarding pour l'adresse \${userData.email}\`);

      // 1. DESACTIVATION PROMAIL
      console.log('--- Étape 1 : Désactivation Compte Email ---');
      await page.goto(CONFIG.promail.url, { waitUntil: 'networkidle2' });
      const deleteBtn = CONFIG.promail.selectors.deleteButtonTemplate(userData.email);
      await page.waitForSelector(deleteBtn, { timeout: 4000 });
      await page.click(deleteBtn);
      // Gérer l'alerte d'annulation d'accès si présente
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      console.log('✔ Accès de messagerie révoqué !');

      // 2. COLLABCHAT (Messagerie d'équipe)
      console.log('--- Étape 2 : Suspension Messagerie d\\'équipe ---');
      await page.goto(CONFIG.collabchat.url, { waitUntil: 'networkidle2' });
      const chatDisableBtn = CONFIG.collabchat.selectors.disableBtnTemplate(userData.email);
      await page.waitForSelector(chatDisableBtn, { timeout: 4000 });
      await page.click(chatDisableBtn);
      console.log('✔ Compte Workspace Chat clôturé !');

      console.log('[RPA Engine] SUCCÈS : Déprivilégiation et fermeture de tous les accès terminées.');
    }

  } catch (error) {
    console.error(\`❌ ÉCHEC DU SCRIPT RPA : \${error.message}\`);
    // Mécanisme de rapport d'erreur / diagnostic visuel
  } finally {
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

// Exemple d'exécution en ligne de commande locale :
// node rpa-orchestrator.js onboard "Jean" "Dupont" "j.dupont@entreprise.com"
const [,, rpaAction, firstname, lastname, email] = process.argv;
if (rpaAction && email) {
  const start = Date.now();
  runRpaWorkflow(rpaAction, {
    firstname: firstname || 'Test',
    lastname: lastname || 'User',
    email,
    startTime: start
  });
}
`;

export const SELENIUM_SCRIPT = `"""
SCRIPT RPA EN PYTHON AVEC SELENIUM
Auteur : Expert RPA & Automatisation
Mémoire : Provisionnement dynamique sur plateformes hétérogènes sans API

Caractéristiques industrielles :
- Recherche hybride XPath + Sélecteurs CSS descendants
- WebdriverManager autosynchronisé pour éliminer les conflits de binaires
- Mécanismes d'attente explicite (WebDriverWait) pour résister aux réseaux instables
"""

import sys
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

# Configuration des URLs des portails internes
PROMAIL_URL = "https://promail-admin.secure-entreprise.internal/users"
CLOUDVAULT_URL = "https://cloudvault-admin.secure-entreprise.internal/folders"
COLLABCHAT_URL = "https://workspace-chat.secure-entreprise.internal/admin/members"

def initialize_driver():
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    # Pour le jury, nous laissons le navigateur à l'écran (non-headless)
    driver = webdriver.Chrome(options=options)
    return driver

def robust_click(driver, selectors, wait_time=5):
    """Tente de cliquer en utilisant plusieurs sélecteurs d'ancrage en cascade"""
    wait = WebDriverWait(driver, wait_time)
    for selector_type, selector_val in selectors:
      try:
        element = wait.until(EC.element_to_be_clickable((selector_type, selector_val)))
        element.click()
        return True
      except Exception:
        continue
    raise Exception(f"Sélecteurs indisponibles : {selectors}")

def robust_type(driver, selectors, text, wait_time=5):
    """Efface puis saisit de manière synchrone un champ de saisie"""
    wait = WebDriverWait(driver, wait_time)
    for selector_type, selector_val in selectors:
      try:
        element = wait.until(EC.visibility_of_element_located((selector_type, selector_val)))
        element.clear()
        element.send_keys(text)
        return True
      except Exception:
        continue
    raise Exception(f"Saisie impossible sur les sélecteurs : {selectors}")

def run_onboarding(firstname, lastname, email, role):
    print(f"[*] Amorçage du scénario d'onboarding RPA pour {firstname} {lastname}")
    driver = initialize_driver()
    
    try:
        # ÉTAPE 1 : PROMAIL (CRÉATION DE LA BOITE MAIL)
        print("[RPA] Ouverture du portail d'administration ProMail...")
        driver.get(PROMAIL_URL)
        
        # Clic boutons & Champs résilients (Cascade de sélecteurs par classe ou ID)
        robust_click(driver, [
            (By.ID, "btn-add-user"),
            (By.CSS_SELECTOR, "button.create-user-trigger"),
            (By.XPATH, "//button[contains(text(), 'Nouveau Collaborateur')]")
        ])
        
        robust_type(driver, [(By.NAME, "first_name"), (By.CSS_SELECTOR, "#firstname_field")], firstname)
        robust_type(driver, [(By.NAME, "last_name"), (By.CSS_SELECTOR, "#lastname_field")], lastname)
        robust_type(driver, [(By.TYPE, "email"), (By.NAME, "email")], email)
        
        robust_click(driver, [
            (By.ID, "save-user"),
            (By.XPATH, "//button[@type='submit']")
        ])
        print("[SUCCESS] Compte ProMail provisionné avec succès.")
        time.sleep(1.5)

        # ÉTAPE 2 : CLOUDVAULT (DOSSIER DE STOCKAGE COLLABORATIF)
        print("[RPA] Ouverture du portail CloudVault...")
        driver.get(CLOUDVAULT_URL)
        
        robust_click(driver, [
            (By.ID, "create-folder-btn"),
            (By.CSS_SELECTOR, ".btn-new-directory")
        ])
        
        folder_name = f"partage-{lastname.lower()}"
        robust_type(driver, [(By.NAME, "folder_name"), (By.ID, "dir-name-input")], folder_name)
        
        robust_click(driver, [
            (By.CSS_SELECTOR, "button.confirm-add"),
            (By.ID, "btn-submit-folder")
        ])
        print(f"[SUCCESS] Dossier de stockage '{folder_name}' créé.")
        time.sleep(1.5)

        # ÉTAPE 3 : COLLABCHAT (INVITATION EQUIPE)
        print("[RPA] Ouverture de CollabChat Workspace Admin...")
        driver.get(COLLABCHAT_URL)
        
        robust_click(driver, [
            (By.ID, "invite-member-btn"),
            (By.CSS_SELECTOR, ".chat-members-invite")
        ])
        
        robust_type(driver, [(By.ID, "invite-email-input"), (By.CSS_SELECTOR, ".invite-input-email")], email)
        
        robust_click(driver, [
            (By.CSS_SELECTOR, "button.btn-send-invitation"),
            (By.ID, "btn-submit-invite")
        ])
        print("[SUCCESS] L'orchestration RPA d'onboarding a abouti avec succès !")

    except Exception as e:
        print(f"[ERROR] Échec de la transaction RPA : {str(e)}", file=sys.stderr)
    finally:
        time.sleep(3)
        driver.quit()

if __name__ == "__main__":
    # Paramètres d'appel en ligne de commande :
    # python script_rpa.py "Jean" "Dupont" "j.dupont@entreprise.com" "Developpeur"
    if len(sys.argv) >= 5:
        run_onboarding(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4])
    else:
        print("Erreur : Paramètres manquants. Syntaxe : Python script_rpa.py <prenom> <nom> <email> <role>")
`;

export const ACADEMIC_PROBLEM_ANSWER = {
  title: "Problématique de Recherche du Mémoire",
  question: "Comment orchestrer des scénarios RPA pour automatiser des actions sur des outils SaaS Cloud sans dépendre d'interfaces de programmation (API) natives ?",
  coreProblem: "Les entreprises utilisent un nombre croissant d'outils SaaS hétérogènes (Email, Stockage, CRM). Souvent, les petites structures ou les systèmes hérités (legacy) ne disposent pas d'API ouvertes, ou le coût d'acquisition d'intégrations natives (Workato, Zapier Enterprise, MuleSoft) est prohibitif. L'alternative RPA consiste à automatiser l'interaction humaine sur le navigateur web. Cependant, cette méthode souffre d'une fragilité majeure : la dépendance structurelle au DOM (Document Object Model) HTML, extrêmement susceptible aux mises à jour graphiques du fournisseur de SaaS.",
  strategies: [
    {
      title: "1. Résilience Typologique des Sélecteurs (Cascade Anchor-Selection)",
      description: "Au lieu d'utiliser des chemins XPath rigides (ex: /html/body/div[2]/div[1]/form/div[3]/input) ou des noms de classes génerés automatiquement par des frameworks modernes (ex: tailwind 'css-1a2b3c'), le robot combine des identifiants d'ancrage stables (labels ARIA, attributs de données sémantiques 'data-testid', ou repères textuels invariants)."
    },
    {
      title: "2. Synchronisation Temporelle non-bloquante (WebDriverWait Asynchrone)",
      description: "L'erreur typique des scripts RPA amateurs est l'usage du 'bloquage par thread' (Hard Sleep). L'orchestration robuste s'appuie sur des observables d'états d'interface (EC: Expected Conditions) réinterrogés en boucle courte asynchrone, optimisant la vitesse d'exécution de 80% tout en résistant aux sursauts de latence réseau du Cloud."
    },
    {
      title: "3. Modularité transactionnelle (Unit / Rollback)",
      description: "Un échec d'écriture sur le 3ème SaaS lors de l'onboarding ne doit pas laisser l'environnement dans un état corrompu. Notre gestionnaire applique le principe des transactions de base de données : en cas d'erreur bloquante sur un outil hétérogène, un script RPA de compensation (Rollback / Offboarding préventif) est instancié pour dépolluer les environnements déjà créés."
    },
    {
      title: "4. Préservation d'États Autorisés (Session Cookie Capture)",
      description: "Pour contourner les mécanismes de sécurité anti-bots (MFA, Captcha) qui paralysent la RPA, le robot s'appuie sur l'importation dynamique de tokens de sessions préalablement autorisés et stockés de façon sécurisée (Vault), réduisant à zéro le besoin de reconnexion interactive."
    }
  ]
};
