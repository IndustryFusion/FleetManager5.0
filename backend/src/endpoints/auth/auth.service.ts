import { Injectable } from '@nestjs/common';
import axios from 'axios';

/**
 * Retrieves tokens from the keylock service.
 * Returns access and refresh tokens.
 * @throws {Error} Throws an error if there is a invalid credentials.
 * Expected behavior:
 * - Positive Test Case: Successful retrieval of tokens with HTTP status code 200.
 * - Negative Test Case: Throws invalid credentials in case of failure.
 */
@Injectable()
export class AuthService {
    private readonly DEFAULT_USERNAME = process.env.USERNAME;
    private readonly DEFAULT_PASSWORD = process.env.PASSWORD;

   login(username: string, password: string): Boolean {
    try {
      if(this.DEFAULT_USERNAME == username && this.DEFAULT_PASSWORD == password) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      throw new Error('Login Failed');
    }
  }
}