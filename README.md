# Setup Login with LinkedIn

## Create LinkedIn App

### Create App

Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps) and create a new app.


![create_linkedin_app](assets/create_linkedin_app.png)

### Create LinkedIn Sign In Product

- Select product `Sign In with LinkedIn using OpenID Connect` and request for access.

![SignIn_Products](assets/SignIn_Products.png)

## Create Cognito User Pool

### Add new Identity Provider

Cognito AWS does not support LinkedIn as an identity provider. So, we need to create a custom identity provider.

![2024-02-22-23-57-30](assets/2024-02-22-23-57-30.png)

Using OpenID Connect, we can create a custom identity provider.

![2024-02-22-23-58-14](assets/2024-02-22-23-58-14.png)

Config `LinkedIn` as an identity provider.

![2024-02-22-23-59-50](assets/2024-02-22-23-59-50.png)

`Client ID` and `Client Secret` are obtained from LinkedIn App.

Map data from LinkedIn to Cognito User Pool.

![2024-02-23-00-01-56](assets/2024-02-23-00-01-56.png)

![2024-02-23-00-02-18](assets/2024-02-23-00-02-18.png)

# Reference

- [LinkedIn OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2?context=linkedin%2Fconsumer%2Fcontext)
- [https://repost.aws/knowledge-center/cognito-linkedin-auth0-social-idp](https://repost.aws/knowledge-center/cognito-linkedin-auth0-social-idp)
