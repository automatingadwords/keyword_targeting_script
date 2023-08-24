import os
import subprocess
import pyperclip
import datetime

CREATE_COMBINED_FILE = True

def check_js_syntax(file_path):
    try:
        # Use Node.js and the built-in JavaScript linter (ESLint) to check syntax
        subprocess.check_output(["node", "-c", file_path])
    except subprocess.CalledProcessError as e:
        print("JavaScript syntax errors found in the file:")
        print(e.output.decode())
        return False

    return True

def combine_js_files():
    # Set the output file name
    output_file = "production.js"

    #set the folder path to this folder
    folder_path = os.path.dirname(os.path.realpath(__file__))

    # Create a list of JavaScript files in the folder
    js_files = []
    for file in os.listdir(folder_path):
        if file.endswith(".js"):
            js_files.append(file)

    # Sort the files alphabetically
    js_files.sort()

    # Create the combined file
    combined_js = ""

    # Add these first, in this order
    start_file_names = [
        "settings.js",
        "constants.js",
        "main.js",
    ]

    settings = {}
    to_do_warning = False
    for start_file_name in start_file_names:
        start_js_file = os.path.join(folder_path, start_file_name)
        if os.path.isfile(start_js_file):
            with open(start_js_file, "r") as file:
                content = file.read()
                if start_file_name == "settings.js":
                    settings = get_settings(content)
                content += "\n\n//end of " +start_file_name+"\n\n"
                content = content.replace("module.exports", "//module.exports")
                content = content.replace("import", "//import")
                content = content.replace("export ", "")
                combined_js += content + "\n\n"
                if content.find("//TODO") > -1:
                  to_do_warning = True
                  print(f"WARNING: TODO found in {start_file_name} file")

    # Add the contents of the remaining .js files
    for js_file in js_files:
        if js_file not in start_file_names and js_file != output_file:  # Avoid re-adding what we've already added
            file_path = os.path.join(folder_path, js_file)
            with open(file_path, "r") as file:
                content = file.read()
                content += "\n\n//end of " +js_file+"\n\n"
                content = content.replace("module.exports", "//module.exports")
                content = content.replace("import", "//import")
                content = content.replace("export ", "")
                combined_js += content + "\n\n"
                if content.find("//TODO") > -1:
                  to_do_warning = True
                  print(f"WARNING: TODO found in {js_file} file")

    combined_js += "// Bundle created at " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if to_do_warning:
        combined_js += "\n\n//Warning: TODOs found in one or more files."
        #add warning to the top of the file
        combined_js = "//Warning: TODOs found in one or more files.\n\n" + combined_js
        combined_js = "console.warn('Warning: TODOs found in one or more files.')\n\n" + combined_js

    if to_do_warning and settings['APP_ENVIRONMENT'].find("PRODUCTION") > -1:
        print("Cannot publish to production with TODOs in the code.")
        pyperclip.copy("//Compile error: Cannot publish to production with TODOs in the code.")
        return
      
    combined_js += "\n" + "// Application environment: " + settings['APP_ENVIRONMENT']
    # combined_js += "\n" + "// Debug mode: " + settings['DEBUG']

    # # Write the combined contents to main.js
    if CREATE_COMBINED_FILE:
        with open(output_file, "w") as file:
            file.write(combined_js)

        # Check the syntax of the combined file
        if not check_js_syntax(output_file):
            return

    # Copy the contents to the clipboard
    pyperclip.copy(combined_js)

    print(f"Combination completed. {output_file} file created, copied to clipboard, and passed syntax checking.")


def get_settings(combined_js):
    settings = {}
    lines = combined_js.split("\n")
    for line in lines:
        if line.find("const APP_ENVIRONMENT =") > -1:
            settings['APP_ENVIRONMENT'] = line.split("=")[1].strip().replace("'", "")
        if line.find("const DEBUG =") > -1:
            settings['DEBUG'] = line.split("=")[1].strip().replace("'", "")
    return settings

# Call the function to combine the files
combine_js_files()