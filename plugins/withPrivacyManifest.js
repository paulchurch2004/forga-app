// FORGA — Config plugin Expo qui injecte le PrivacyInfo.xcprivacy
// dans le bundle iOS au moment du build EAS.
//
// Pourquoi : Apple exige depuis mai 2024 un Privacy Manifest pour les
// apps iOS qui utilisent des "Required Reason APIs" (UserDefaults,
// FileTimestamp, SystemBootTime, DiskSpace). Sans ce fichier dans le
// bundle, l'app est rejetée automatiquement à la review.
//
// Expo SDK 51+ ne copie PAS automatiquement les .xcprivacy déposés
// dans assets/ vers le bundle iOS. Ce plugin le fait via la
// `withDangerousMod` qui s'exécute au prebuild.
//
// Référence : https://developer.apple.com/documentation/bundleresources/privacy_manifest_files

const { withDangerousMod, withXcodeProject } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MANIFEST_FILENAME = 'PrivacyInfo.xcprivacy';

/** Plugin principal : copie le fichier + l'ajoute au projet Xcode. */
const withPrivacyManifest = (config) => {
  // Étape 1 : copier le fichier depuis assets/ vers le projet iOS au prebuild
  config = withDangerousMod(config, [
    'ios',
    async (mod) => {
      const projectRoot = mod.modRequest.projectRoot;
      const platformProjectRoot = mod.modRequest.platformProjectRoot;
      const projectName = mod.modRequest.projectName;

      const source = path.join(projectRoot, 'assets', MANIFEST_FILENAME);
      if (!fs.existsSync(source)) {
        console.warn(
          `[withPrivacyManifest] ${MANIFEST_FILENAME} introuvable dans assets/. ` +
            `Le bundle iOS ne contiendra PAS de manifest → rejet Apple garanti.`,
        );
        return mod;
      }

      // Le manifest doit aller au "root" du target principal pour être
      // détecté par Xcode + bundlé dans l'IPA.
      const destDir = path.join(platformProjectRoot, projectName);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      const dest = path.join(destDir, MANIFEST_FILENAME);
      fs.copyFileSync(source, dest);

      return mod;
    },
  ]);

  // Étape 2 : référencer le fichier dans le projet Xcode (sinon Xcode
  // ne le bundle pas même s'il est dans le dossier)
  config = withXcodeProject(config, async (mod) => {
    const project = mod.modResults;
    const projectName = mod.modRequest.projectName;
    const manifestRelativePath = path.join(projectName, MANIFEST_FILENAME);

    // Vérifier si déjà ajouté (évite les doublons à chaque prebuild)
    const existingFile = project.pbxFileReferenceSection();
    const alreadyAdded = Object.values(existingFile).some(
      (entry) =>
        entry && typeof entry === 'object' && entry.path === `"${MANIFEST_FILENAME}"`,
    );

    if (!alreadyAdded) {
      try {
        project.addResourceFile(
          manifestRelativePath,
          { target: project.getFirstTarget().uuid },
          project.getFirstProject().firstProject.mainGroup,
        );
      } catch (e) {
        // addResourceFile lance parfois sur des structures déjà touchées
        // par d'autres plugins. Le fichier est dans le dossier de toute
        // façon — au pire on perd l'inclusion auto-Xcode mais la copie
        // est faite.
        console.warn(`[withPrivacyManifest] addResourceFile failed: ${e?.message}`);
      }
    }

    return mod;
  });

  return config;
};

module.exports = withPrivacyManifest;
