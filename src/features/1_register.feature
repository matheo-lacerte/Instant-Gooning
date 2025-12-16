Feature: Inscription utilisateur
  Scenario: Inscription réussie
    Given je suis sur la page d'inscription
    When je saisis des nouvelles données
    When je valide le formulaire d'inscription
    Then je suis inscrit
    
  Scenario: Inscription échouée
    Given je suis sur la page d'inscription
    When je saisis un email existant
    When je valide le formulaire d'inscription
    Then je vois le message d'erreur "Email déjà utilisé"