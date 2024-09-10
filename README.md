This testing app using Python and Flask aims to train the Python language and the Flask mini framework!

To configure the PostgreSQL database for your Todo app, we're currently using environment variables to set up the database connection. Here's how it's configured:

In the app.py file, we're using the DATABASE_URL environment variable to set the SQLAlchemy database URI:

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")

The DATABASE_URL should be in the format:

postgresql://username:password@host:port/database_name

We're also using individual environment variables for database configuration:

PGDATABASE: The name of your PostgreSQL database
PGUSER: The username for your PostgreSQL database
PGPASSWORD: The password for your PostgreSQL user
PGHOST: The host where your PostgreSQL server is running
PGPORT: The port on which your PostgreSQL server is listening
To modify the database configuration:

Update the DATABASE_URL environment variable with your PostgreSQL connection string.
Alternatively, update the individual PG* environment variables with your database details.
