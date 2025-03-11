addListeners();

function animaster(steps) {
    const _steps = steps ? [...steps] : [];

    return {
        _steps,


        move(element, duration, translation) {
            return this
                .addMove(duration, translation)
                .play(element);
        },


        fadeIn(element, duration) {
            return this
                .addFadeIn(duration)
                .play(element);
        },


        scale(element, duration, ratio) {
            return this
                .addScale(duration, ratio)
                .play(element);
        },


        fadeOut(element, duration) {
            return this
                .addFadeOut(duration)
                .play(element);
        },

        moveAndHide(element, duration) {
            const moveDuration = (duration * 2) / 5;
            const fadeDuration = (duration * 3) / 5;

            const animation = animaster()
                .addMove(moveDuration, { x: 100, y: 20 })
                .addFadeOut(fadeDuration);
            
            return animation.play(element);
        },


        showAndHide(element, duration) {
            const oneThird = duration / 3;

            const animation = animaster()
                .addFadeIn(oneThird)
                .addDelay(oneThird)
                .addFadeOut(oneThird);

            return animation.play(element);
        },

        heartBeating(element) {
            const animation = animaster()
                .addScale(500, 1.4)
                .addScale(500, 1);

            return animation.play(element, true);
        },

        addMove(duration, translation) {
            const newSteps = [...this._steps, {
                name: 'move',
                duration,
                translation
            }];
            return animaster(newSteps);
        },


        addScale(duration, ratio) {
            const newSteps = [...this._steps, {
                name: 'scale',
                duration,
                ratio
            }];
            return animaster(newSteps);
        },

        addFadeIn(duration) {
            const newSteps = [...this._steps, {
                name: 'fadeIn',
                duration
            }];
            return animaster(newSteps);
        },


        addFadeOut(duration) {
            const newSteps = [...this._steps, {
                name: 'fadeOut',
                duration
            }];
            return animaster(newSteps);
        },


        addDelay(duration) {
            const newSteps = [...this._steps, {
                name: 'delay',
                duration
            }];
            return animaster(newSteps);
        },

        play(element, cycled = false) {
            let stopFlag = false;
            const initialState = saveInitialState(element);

            const chainAnimation = (steps) => {
                let currentStepIndex = 0;

                const runNextStep = () => {
                    if (stopFlag) {
                        return;
                    }
                    if (currentStepIndex >= steps.length) {
                        if (cycled) {
                            currentStepIndex = 0;
                        } else {
                            return;
                        }
                    }

                    const step = steps[currentStepIndex];
                    currentStepIndex++;
                    playSingleStep(element, step);
                    setTimeout(runNextStep, step.duration);
                };

                runNextStep();
            };

            chainAnimation(this._steps);

            return {
                stop() {
                    stopFlag = true;
                },
                reset() {
                    stopFlag = true; 
                    resetElement(element, initialState);
                }
            };
        },

        buildHandler(cycled = false) {
            const steps = this._steps; 
            return function () {
                const element = this;
                animaster(steps).play(element, cycled);
            };
        }
    };
}

function saveInitialState(element) {
    return {
        classList: [...element.classList],
        style: {
            transitionDuration: element.style.transitionDuration,
            transform: element.style.transform,
        }
    };
}

function resetElement(element, initialState) {
    element.style.transitionDuration = null;
    element.style.transform = null;
    element.style.opacity = null;

    element.className = '';
    initialState.classList.forEach(cls => element.classList.add(cls));
}

function playSingleStep(element, step) {
    switch (step.name) {
        case 'move':
            element.style.transitionDuration = `${step.duration}ms`;
            element.style.transform = getTransform(step.translation, null);
            break;

        case 'scale':
            element.style.transitionDuration = `${step.duration}ms`;
            element.style.transform = getTransform(null, step.ratio);
            break;

        case 'fadeIn':
            element.style.transitionDuration = `${step.duration}ms`;
            element.classList.remove('hide');
            element.classList.add('show');
            element.style.opacity = null;
            break;

        case 'fadeOut':
            element.style.transitionDuration = `${step.duration}ms`;
            element.classList.remove('show');
            element.classList.add('hide');
            break;

        case 'delay':
            break;
    }
}

function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}

function addListeners() {
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeIn(block, 2000);
        });

    document.getElementById('fadeOutPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animaster().fadeOut(block, 2000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animaster().move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animaster().scale(block, 1000, 1.25);
        });

    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock');
            animaster().showAndHide(block, 3000);
        });

    let moveAndHideAnimation;
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            moveAndHideAnimation = animaster().moveAndHide(block, 3000);
        });
    document.getElementById('moveAndHideReset')
        .addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
        });

    let heartBeatingAnimation;
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock');
            heartBeatingAnimation = animaster().heartBeating(block);
        });
    document.getElementById('heartBeatingStop')
        .addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }
        });
}
