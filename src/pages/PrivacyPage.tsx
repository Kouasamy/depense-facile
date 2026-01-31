import './LegalPage.css'

interface PrivacyPageProps {
  onBack: () => void
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  const lastUpdated = "31 janvier 2026"

  return (
    <div className="legal-page">
      {/* Header */}
      <header className="legal-header">
        <button onClick={onBack} className="btn btn-secondary btn-icon">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="legal-title">Politique de confidentialité</h1>
          <p className="legal-date">Dernière mise à jour : {lastUpdated}</p>
        </div>
      </header>

      {/* Content */}
      <main className="legal-content">
        {/* Introduction */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon primary">
            <span className="material-symbols-outlined">shield</span>
          </div>
          <div className="legal-section-content">
            <h2>Introduction</h2>
            <p>
              Chez <strong>GèreTonDjai</strong>, nous accordons une grande importance à la protection 
              de vos données personnelles. Cette politique de confidentialité explique comment nous 
              collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application.
            </p>
          </div>
        </section>

        {/* Engagement */}
        <section className="legal-commitment card animate-fade-in-up delay-1">
          <div className="legal-commitment-header">
            <span className="material-symbols-outlined">lock</span>
            <h3>Notre engagement</h3>
          </div>
          <ul className="legal-commitment-list">
            <li><span className="dot"></span> Vos données restent sur votre appareil (offline-first)</li>
            <li><span className="dot"></span> Aucune vente de données à des tiers</li>
            <li><span className="dot"></span> Chiffrement des données sensibles</li>
            <li><span className="dot"></span> Contrôle total sur vos informations</li>
          </ul>
        </section>

        {/* Données collectées */}
        <section className="legal-section card animate-fade-in-up delay-2">
          <div className="legal-section-icon warning">
            <span className="material-symbols-outlined">database</span>
          </div>
          <div className="legal-section-content">
            <h2>1. Données que nous collectons</h2>
            <h4>Informations de compte</h4>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Mot de passe (stocké de manière sécurisée et hashé)</li>
            </ul>
            <h4>Données financières</h4>
            <ul>
              <li>Montants des dépenses et revenus</li>
              <li>Catégories de dépenses</li>
              <li>Descriptions des transactions</li>
              <li>Moyens de paiement utilisés</li>
              <li>Budgets définis</li>
            </ul>
            <h4>Données techniques</h4>
            <ul>
              <li>Type d'appareil et navigateur</li>
              <li>Préférences de thème (clair/sombre)</li>
              <li>Données de session</li>
            </ul>
          </div>
        </section>

        {/* Utilisation */}
        <section className="legal-section card animate-fade-in-up delay-3">
          <div className="legal-section-icon success">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div className="legal-section-content">
            <h2>2. Comment nous utilisons vos données</h2>
            <p>Nous utilisons vos informations pour :</p>
            <ul>
              <li>Fournir et améliorer nos services</li>
              <li>Permettre le suivi de vos dépenses et revenus</li>
              <li>Générer des rapports et statistiques personnalisés</li>
              <li>Vous envoyer des alertes de budget (si activées)</li>
              <li>Assurer la sécurité de votre compte</li>
              <li>Résoudre les problèmes techniques</li>
            </ul>
            <div className="legal-highlight">
              <strong>Nous ne vendons jamais vos données</strong> à des tiers à des fins publicitaires ou commerciales.
            </div>
          </div>
        </section>

        {/* Stockage */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon primary">
            <span className="material-symbols-outlined">lock</span>
          </div>
          <div className="legal-section-content">
            <h2>3. Stockage et sécurité</h2>
            <div className="legal-info-box">
              <h4>Stockage local (IndexedDB)</h4>
              <p>
                Vos données financières sont stockées localement sur votre appareil dans une base de données IndexedDB. 
                Cela signifie que vos informations restent sur votre appareil et ne sont pas automatiquement envoyées à nos serveurs.
              </p>
            </div>
            <div className="legal-info-box">
              <h4>Synchronisation cloud (optionnelle)</h4>
              <p>
                Si vous activez la synchronisation, vos données seront chiffrées avant d'être envoyées à nos serveurs sécurisés 
                pour permettre l'accès depuis plusieurs appareils.
              </p>
            </div>
            <p>
              Nous utilisons des mesures de sécurité standard de l'industrie, incluant le hachage des mots de passe 
              et des connexions sécurisées (HTTPS).
            </p>
          </div>
        </section>

        {/* Partage */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon danger">
            <span className="material-symbols-outlined">share</span>
          </div>
          <div className="legal-section-content">
            <h2>4. Partage des données</h2>
            <p>Nous ne partageons vos données personnelles avec des tiers que dans les cas suivants :</p>
            <ul>
              <li><strong>Avec votre consentement explicite</strong></li>
              <li><strong>Pour respecter une obligation légale</strong> (demande judiciaire, réglementation)</li>
              <li><strong>Pour protéger nos droits</strong> en cas de violation des conditions d'utilisation</li>
            </ul>
            <p>Nous n'utilisons pas de services d'analyse tiers qui collectent vos données financières.</p>
          </div>
        </section>

        {/* Droits */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon warning">
            <span className="material-symbols-outlined">delete</span>
          </div>
          <div className="legal-section-content">
            <h2>5. Vos droits</h2>
            <p>Vous disposez des droits suivants concernant vos données :</p>
            <div className="legal-rights-grid">
              <div className="legal-right-item">
                <strong>Droit d'accès</strong>
                <p>Accéder à toutes vos données personnelles</p>
              </div>
              <div className="legal-right-item">
                <strong>Droit de rectification</strong>
                <p>Corriger vos informations inexactes</p>
              </div>
              <div className="legal-right-item">
                <strong>Droit à l'effacement</strong>
                <p>Supprimer votre compte et toutes vos données</p>
              </div>
              <div className="legal-right-item">
                <strong>Droit à la portabilité</strong>
                <p>Exporter vos données en PDF</p>
              </div>
            </div>
            <p>Pour exercer ces droits, utilisez les options dans les Paramètres de l'application ou contactez-nous directement.</p>
          </div>
        </section>

        {/* Reconnaissance vocale */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon primary">
            <span className="material-symbols-outlined">mic</span>
          </div>
          <div className="legal-section-content">
            <h2>6. Reconnaissance vocale</h2>
            <p>
              Notre application utilise la reconnaissance vocale pour faciliter la saisie des dépenses. 
              Voici ce que vous devez savoir :
            </p>
            <ul>
              <li>La reconnaissance vocale utilise l'API Web Speech de votre navigateur</li>
              <li>Les enregistrements audio sont traités localement et ne sont pas stockés</li>
              <li>Seul le texte transcrit est utilisé pour créer vos dépenses</li>
              <li>Vous pouvez désactiver la reconnaissance vocale à tout moment</li>
            </ul>
            <div className="legal-highlight">
              <strong>Note :</strong> La qualité de la reconnaissance vocale dépend de votre navigateur et de votre appareil.
            </div>
          </div>
        </section>

        {/* Cookies */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-content">
            <h2>7. Cookies et stockage local</h2>
            <p>GèreTonDjai utilise le stockage local (localStorage et IndexedDB) pour :</p>
            <ul>
              <li>Stocker vos préférences (thème, langue)</li>
              <li>Maintenir votre session de connexion</li>
              <li>Stocker vos données financières localement</li>
            </ul>
            <p>Nous n'utilisons pas de cookies de suivi ou de publicité.</p>
          </div>
        </section>

        {/* Modifications */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-content">
            <h2>8. Modifications de cette politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité périodiquement. 
              Les modifications importantes vous seront notifiées via l'application.
            </p>
            <p>
              Nous vous encourageons à consulter régulièrement cette page pour rester informé 
              de nos pratiques en matière de confidentialité.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon success">
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div className="legal-section-content">
            <h2>9. Nous contacter</h2>
            <p>
              Si vous avez des questions sur cette politique de confidentialité ou sur vos données personnelles, 
              contactez-nous :
            </p>
            <div className="legal-info-box">
              <p><strong>Email :</strong> <a href="mailto:privacy@depensefacile.ci" className="legal-email">privacy@depensefacile.ci</a></p>
              <p><strong>Délai de réponse :</strong> Sous 48 heures ouvrées</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="legal-footer">
          <p>© 2026 GèreTonDjai. Tous droits réservés.</p>
          <p>Votre confiance est notre priorité</p>
        </footer>
      </main>
    </div>
  )
}

export default PrivacyPage
