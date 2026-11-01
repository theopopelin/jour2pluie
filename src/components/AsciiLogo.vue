<script setup>
import { ref, onMounted } from "vue";

const banner = ref("");

onMounted(async () => {
  try {
    const response = await fetch("/banner.txt");

    if (!response.ok) {
      throw new Error("Unable to load banner.");
    }

    banner.value = await response.text();
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <div class="page-background" aria-hidden="true">
    <pre class="ascii-banner">{{ banner }}</pre>
  </div>
  <header class="site-header">
    <pre class="ascii-logo"><span>
                .=##*-.                                                <span class="logo-green">.-+##%%#*+-..</span>                    :***=.                  :+##*-                                              
                -%%@%#:                                              <span class="logo-green">.+#%@@%%%@@@%#+.</span>                   -%@%*.                  =%@@%*.                                             
                .=##*-.                                             <span class="logo-green">:+%@%%=:  .=#%@%*:</span>                  -%@%*.                  :=##+:                                              
                .-===:.   :-=+***+==:   .:===-.    .-===-..====--===<span class="logo-green">+*%%#+.    .=%@%#:</span> ===-:-+***+=-.   -%@%*. :===-     .-===- :-===:   .-=+***+=-:                                
                :#%@%+: .+%%@@@@@@@@%+. :=%@%*.    :*%@%*:-#%@%%%@@@+.         <span class="logo-green">:*%@%# </span>=%@@%%%@@@@@@%#=  -%@%*..-%@%*     :+@@%*.-#@@#+..-#%@@@@@@@%%*:                              
                :#%@%+::#%@%#+-:-+*%@%#-:=%@%*.    :*%@%*:-#%@%%*+==:     <span class="logo-green">.:--*#@@%#- </span>=%@@%#+-::=*%%%#-.-%@%*..-%@%*     :+@@%*.-#@@#+.=#@@#+-::=*%@%+:                             
                :#%@%+-=%@%#:     :*%@%+==%@%*.    :*%@%*:-#%@%+.      <span class="logo-green">:+##%%@@@%#=.  </span>=%@%*.     :+%@%*--%@%*..-%@%*     :+@@%*.-#@@#+-*%@@%#####%%@@#=                             
                :#%@%+-+@@%*.     .*%@%*==%@%*.    :*%@%*:-#%@#=.    <span class="logo-green">:*%@%%##*+-.     </span>=%@%*.     :+%@%#--%@%*..-%@%*     :+@@%*.-#@@#+-*@@%%%%%%%%%%%#+                             
                :#%@%+:-%@%#-.    :#%@%+-=%@%#:    -#%@%*:-#%@#=.   <span class="logo-green">:+%@%#-.          </span>=%@%#-.    :*%@%*:-%@%*..-%@%*.    =#@@%*.-#@@#+:+%@%*-::::-++-:. <span class="logo-green">-+*+-.</span>                      
                :#%@%+::*%@@%#+=+*%@@%*: :#%@%#+==*%@@@%*:-#%@#=.   <span class="logo-green">-*@@%%##########* </span>=%@@@%*+==*%@@%#:.-%@%*. -#%@%#+==*%@@@%*.-#@@#+.-*%@%%+==+#%@%+<span class="logo-green">=+%@@@%=</span>                      
                :#%@%+:  -+%%@@@@@%%*-.   :+#%@@@@%#*%@%*:-#%@#=.   <span class="logo-green">-*@@@@@@@@@@@@@%# </span>=%@%%*%%@@@@%#+:  -%@%*. .:+#%@@@%%**@@%*.-#@@#+. :=#%@@@@@@%*=.<span class="logo-green">.=#%@@#=</span>                      
                :#%@%+:     .:=+=-.           :-:.                                    =%@%*. :-+=:                 .:-:.                   .:-==-:.     <span class="logo-green">.-=-.</span>                       
              --+%%@%+.                                                               =%@%*.                                                                                        
             .*%@@@%*:                                                                =%@%*.                                                                                        
              --==-:                                                                  :===:                         
    </span></pre>
  </header>
</template>