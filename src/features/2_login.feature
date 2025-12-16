Feature: Connexion utilisateur
  Scenario: Connexion réussie
    Given je suis sur la page de connexion
    When je saisis un email valide et un mot de passe valide
    When je valide le formulaire de connexion
    Then je suis connecté
    
  Scenario: Connexion échouée
    Given je suis sur la page de connexion
    When je saisis un email invalide et un mot de passe invalide
    When je valide le formulaire de connexion
    Then je vois le message d'erreur "Email ou mot de passe invalide"