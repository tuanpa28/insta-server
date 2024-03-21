class UserGoogleDto {
  _id?: string;
  googleId?: string;
  username: string;
  email: string;
  password: string;
  full_name: string;
  profile_image: string;
  bio: string;
  date_of_birth: Date;
  gender: string;
  current_city: string;
  from: string;
  followers: Array<string>;
  followings: Array<string>;
  tick: boolean;
  isAdmin: boolean;
}

export default UserGoogleDto;
