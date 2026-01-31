import './LegalPage.css'

interface TermsPageProps {
  onBack: () => void
}

export function TermsPage({ onBack }: TermsPageProps) {
  const lastUpdated = "31 janvier 2026"

  return (
    <div className="legal-page">
      {/* Header */}
      <header className="legal-header">
        <button onClick={onBack} className="btn btn-secondary btn-icon">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="legal-title">Conditions d'utilisation</h1>
          <p className="legal-date">Dernière mise à jour : {lastUpdated}</p>
        </div>
      </header>

      {/* Content */}
      <main className="legal-content">
        {/* Introduction */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon primary">
            <span className="material-symbols-outlined">description</span>
          </div>
          <div className="legal-section-content">
            <h2>Introduction</h2>
            <p>
              Bienvenue sur <strong>GèreTonDjai</strong>. En utilisant notre application, 
              vous acceptez les présentes conditions d'utilisation. Veuillez les lire attentivement 
              avant d'utiliser nos services.
            </p>
          </div>
        </section>

        {/* Acceptation */}
        <section className="legal-section card animate-fade-in-up delay-1">
          <div className="legal-section-icon success">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div className="legal-section-content">
            <h2>1. Acceptation des conditions</h2>
            <p>
              En accédant à l'application GèreTonDjai ou en l'utilisant, vous acceptez d'être lié par ces conditions. 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.
            </p>
            <ul>
              <li>Vous devez avoir au moins 18 ans pour utiliser ce service</li>
              <li>Vous êtes responsable de maintenir la confidentialité de votre compte</li>
              <li>Vous acceptez de fournir des informations exactes et à jour</li>
            </ul>
          </div>
        </section>

        {/* Description */}
        <section className="legal-section card animate-fade-in-up delay-2">
          <div className="legal-section-icon warning">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div className="legal-section-content">
            <h2>2. Description du service</h2>
            <p>GèreTonDjai est une application de gestion financière personnelle qui permet de :</p>
            <ul>
              <li>Enregistrer vos dépenses par voix ou texte</li>
              <li>Suivre vos revenus et dépenses</li>
              <li>Visualiser vos statistiques financières</li>
              <li>Définir des budgets par catégorie</li>
              <li>Exporter vos données en PDF</li>
            </ul>
            <p>
              L'application fonctionne en mode "offline-first", ce qui signifie que vos données 
              sont stockées localement sur votre appareil et peuvent être synchronisées avec le cloud.
            </p>
          </div>
        </section>

        {/* Compte */}
        <section className="legal-section card animate-fade-in-up delay-3">
          <div className="legal-section-content">
            <h2>3. Compte utilisateur</h2>
            <p>Pour utiliser GèreTonDjai, vous devez créer un compte. Vous êtes responsable de :</p>
            <ul>
              <li>Maintenir la confidentialité de votre mot de passe</li>
              <li>Toutes les activités qui se produisent sous votre compte</li>
              <li>Nous notifier immédiatement de toute utilisation non autorisée</li>
            </ul>
            <p>
              Nous nous réservons le droit de suspendre ou de résilier votre compte 
              en cas de violation de ces conditions.
            </p>
          </div>
        </section>

        {/* Utilisation */}
        <section className="legal-section card animate-fade-in-up delay-4">
          <div className="legal-section-icon danger">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div className="legal-section-content">
            <h2>4. Utilisation acceptable</h2>
            <p>Vous vous engagez à ne pas :</p>
            <ul>
              <li>Utiliser l'application à des fins illégales</li>
              <li>Tenter de pirater ou compromettre la sécurité de l'application</li>
              <li>Transmettre des virus ou codes malveillants</li>
              <li>Collecter des informations sur d'autres utilisateurs</li>
              <li>Utiliser l'application pour des activités frauduleuses</li>
            </ul>
          </div>
        </section>

        {/* Propriété */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-content">
            <h2>5. Propriété intellectuelle</h2>
            <p>
              L'application GèreTonDjai et tout son contenu (logos, textes, graphiques, 
              logiciels) sont protégés par les lois sur la propriété intellectuelle.
            </p>
            <p>
              Vous conservez la propriété de vos données financières personnelles. 
              Nous ne revendiquons aucun droit de propriété sur vos informations.
            </p>
          </div>
        </section>

        {/* Responsabilité */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon primary">
            <span className="material-symbols-outlined">balance</span>
          </div>
          <div className="legal-section-content">
            <h2>6. Limitation de responsabilité</h2>
            <p>L'application est fournie "en l'état" sans aucune garantie. Nous ne sommes pas responsables de :</p>
            <ul>
              <li>La perte de données due à des problèmes techniques</li>
              <li>Les décisions financières prises sur la base des informations de l'application</li>
              <li>Les interruptions de service ou erreurs techniques</li>
              <li>Les dommages indirects résultant de l'utilisation de l'application</li>
            </ul>
            <div className="legal-highlight">
              <strong>Important :</strong> GèreTonDjai est un outil d'aide à la gestion budgétaire 
              et ne constitue pas un conseil financier professionnel.
            </div>
          </div>
        </section>

        {/* Modifications */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-content">
            <h2>7. Modifications des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications entreront en vigueur dès leur publication dans l'application.
            </p>
            <p>
              En continuant à utiliser l'application après toute modification, 
              vous acceptez les nouvelles conditions.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="legal-section card animate-fade-in-up">
          <div className="legal-section-icon success">
            <span className="material-symbols-outlined">mail</span>
          </div>
          <div className="legal-section-content">
            <h2>8. Contact</h2>
            <p>
              Pour toute question concernant ces conditions d'utilisation, 
              vous pouvez nous contacter à : 
              <a href="mailto:contact@depensefacile.ci" className="legal-email">
                contact@depensefacile.ci
              </a>
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="legal-footer">
          <p>© 2026 GèreTonDjai. Tous droits réservés.</p>
          <p>Application de gestion financière personnelle pour la Côte d'Ivoire</p>
        </footer>
      </main>
    </div>
  )
}

export default TermsPage
