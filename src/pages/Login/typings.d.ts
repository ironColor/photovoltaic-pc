declare namespace Login {
  type LoginParams = {
    username?: string;
    password?: string;
  };

  type LoginResult = {
    tokenHead: string;
    token: string;
  };

  type CurrentUser = {
    id?: string;
    username?: string;
    icon?: string;
    bindName?: string;
  };
}
