import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
import sys

def fetch_env_file(bucket_name, file_key, local_file_path, access_key, secret_key, endpoint_url):
    # Create an S3 client
    s3_client = boto3.client('s3', 
                              endpoint_url=endpoint_url,
                              aws_access_key_id=access_key, 
                              aws_secret_access_key=secret_key)

    try:
        # Fetch the file from S3
        s3_client.download_file(bucket_name, file_key, local_file_path)
        print(f'Successfully downloaded {file_key} to {local_file_path}')
    except FileNotFoundError:
        print('The specified file was not found')
        sys.exit(1)
    except NoCredentialsError:
        print('Credentials not available')
        sys.exit(1)
    except ClientError as e:
        print(f'Error: {e}')
        sys.exit(1)

if __name__ == '__main__':
    # Environment variables
    BUCKET_NAME = os.environ['IONOS_BUCKET']
    FILE_KEY = os.environ['IONOS_FILE_KEY']
    LOCAL_FILE_PATH = 'frontend/.env.development'
    ACCESS_KEY = os.environ['IONOS_ACCESS_KEY']
    SECRET_KEY = os.environ['IONOS_SECRET_KEY']
    ENDPOINT_URL = os.environ['IONOS_ENDPOINT']

    # Fetch the env file
    fetch_env_file(BUCKET_NAME, FILE_KEY, LOCAL_FILE_PATH, ACCESS_KEY, SECRET_KEY, ENDPOINT_URL)

