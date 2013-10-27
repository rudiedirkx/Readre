<?php

// http://www.bishopfox.com/blog/2013/10/linkedin-intro/

if ( empty($_GET['url']) ) {
	exit('Need <code>url</code>.');
}

// header('Content-type: html/text; charset=utf-8');

// Fetch resource
$url = $_GET['url'];
$cid = 'raw-' . base64_encode($url) . '.html';
$cfile = 'db/' . $cid;
$html = file_get_contents(($cexists = file_exists($cfile)) ? 'db/' . $cid : $url);
$cexists or file_put_contents($cfile, $html);

// Strip all from:
// - script
// - link
// - style
$html = preg_replace('#<script[\s\S]*?</script>#', '', $html);
$html = preg_replace('#<link[^>]+?>#', '', $html);
$html = preg_replace('#<style[\s\S]*?</style>#', '', $html);

// DEBUG //
// $html = str_replace('class="post"', 'class="dus post ass"', $html);
// DEBUG //

// Now the hard part: extract readable content
// - #content
// - .post
// - .content
var_dump(preg_match('#<(\w+)[^>]+id="content"#', $html, $match), $match);
var_dump(preg_match('#<(\w+)[^>]+class="([^"]+\s+)*post(\s+[^"]+)*"#', $html, $match), $match);

// Strip nonsense
$tags = array('a', 'p', 'blockquote', 'h2', 'h3', 'h4', 'strong', 'i', 'b', 'br', 'em', 'code');
// $html = strip_tags($html, '<' . implode('><', $tags) . '>');

// Print
echo '<meta charset="utf-8" />';
echo $html;
