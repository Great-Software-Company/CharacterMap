<!DOCTYPE html>
<html lang="en">
<head>
    <?php include "_head.php"; ?>
    <title>Character Map</title>
</head>
<body class="">
<?php include "_navbar.php"; ?>
    <!-- Main content placeholder -->
    <div class="container mt-4">
        <div id="copied-message" class="alert alert-success text-center d-none" role="alert" style="position:fixed;top:90px;left:50%;transform:translateX(-50%);z-index:2000;min-width:200px;max-width:90vw;"></div>
        <div id="char-grid" class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
    <?php for ($i = 0; $i < 256; $i++): ?>
      <div class="col">
        <div class="card ascii-card text-center" id="ascii-box-<?php echo $i; ?>">
          <div class="card-body">
            <div class="skeleton-loader" style="height:3em;width:100%;background:#e9ecef;border-radius:0.5em;"></div>
          </div>
        </div>
      </div>
    <?php endfor; ?>
    </div>
        <div id="char-grid-controls" class="text-center my-4"></div>
        <!-- Static text section -->
        <section id="static-info" class="mt-5 mb-4 text-start" style="max-width:900px;margin-left:auto;margin-right:auto;">
            <h1>Online Character Map</h1>
            <p>CharacterMap.org is a simple online character map. It is a tool that allows you to view the ASCII table and Unicode characters.</p>

            <h2>How to use the character map?</h2>
            <p>You can browse all the characters by category or use the search bar to search for unicode characters including emojis. 
              For example, you can search for emojis based on their name.</p>
            
            <p>The top right corner of the user interface has a Settings button, which allows you to choose what data you want to see. Namely:
              <ul>
                <li>Numeric code</li>
                <li>Octal code</li>
                <li>Hexadecimal code</li>
                <li>Symbol description</li>
                <li>Unicode code points</li>
                <li>HTML code</li>
              </ul>
            </p>

            <p>The Numeric code is the decimal value of the character, it is also sometimes called the <strong>ASCII code</strong> 
            or the <strong>ASCII decimal code</strong> or the character’s <strong>code point value</strong>. These values 
            are most used by programmers and developers. The Octal codes and Hexadecimal character codes are similar, but simply represent 
            the character’s unique ID value in a different number format.</p>

            <p>The Symbol description is the name of the character. The Unicode code points are the so called U+ code of the character. 
              You can use the U+ code to manually input the character into a text field by using any unicode input program. The HTML code
              is the HTML code of the character. It is used to display the character in a web page. This is also mostly used by developers.</p>

            <p>The search bar allows you to search for characters by name, description, or Unicode code point. You can also search for 
              characters by their HTML code and by entering their numeric code. You can also enter a numeric code range. 
            For example, searching for “65-90” will show you all the characters from 65 to 90, which would be the ASCII characters A to Z.</p>

            <p>The character grid displays the characters and symbols. You can click on a character to copy it to the clipboard. Clicking 
              the character will copy the character and its currently visible information to the clipboard.
            </p>

            <h2>What is the ASCII table?</h2>
            <p>The ASCII table, short for American Standard Code for Information Interchange, 
              is a character encoding standard that represents text in computers, 
              telecommunications equipment, and other devices that use text. Basically, ASCII code is the numerical representation of a character such as “A”.
              The ASCII system was developed in the 1960’s and many of the original character use cases are no longer relevant today. 
              Nevertheless, the core idea of ASCII codes is still used today in many different ways, especially in programming and computer science.
              </p>

            <h2>CharacterMap.org is a free online character map</h2>
            <p>I made this website because I wanted a simple way to see the ASCII Table of characters, and to be able to find 
              unicode characters with their HTML codes and other information easily. If you like this website, 
              please send its link to random people and websites. Thank you!</p>
            <p>PS. If you are wondering who I am, you can check this out: <a href="https://greatsoftwarecompany.com/" target="_blank">GreatSoftwareCompany.com<?= $outside_link_icon; ?></a></p>
        </section>
    </div>

  

    <?php include "_footer.php" ?>


    
</body>
</html>
