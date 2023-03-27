const cards = document.querySelectorAll('.card-inner')

cards.forEach((card)=> {
   card.addEventListener( 'click', () => {
      card.classList.toggle('is-flipped')
  })
})